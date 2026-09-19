(function () {
  'use strict';

  const appScriptSrc = document.currentScript && document.currentScript.src;

  function loadStoryEngine() {
    if (window.CYOAStoryEngine) return Promise.resolve(window.CYOAStoryEngine);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = false;
      try {
        script.src = appScriptSrc ? new URL('cyoa-story-engine.js', appScriptSrc).href : 'js/cyoa-story-engine.js';
      } catch (_error) {
        script.src = 'js/cyoa-story-engine.js';
      }
      script.onload = () => window.CYOAStoryEngine ? resolve(window.CYOAStoryEngine) : reject(new Error('CYOA engine loaded without registering itself.'));
      script.onerror = () => reject(new Error('Could not load js/cyoa-story-engine.js.'));
      document.head.appendChild(script);
    });
  }

  loadStoryEngine().then(boot).catch(error => {
    document.body.innerHTML = `<main class="fallback-error"><h1>Story engine could not open.</h1><p>${escapeHtmlStatic(error.message)}</p><p>Keep <code>js/cyoa-story-engine.js</code> beside <code>js/app.js</code>.</p></main>`;
  });

  function escapeHtmlStatic(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));
  }

  async function boot(CYOA) {
    const bundle = window.JASPER_FANFIC_DATA && Array.isArray(window.JASPER_FANFIC_DATA.series)
      ? window.JASPER_FANFIC_DATA
      : {
          schema_version: '3.0',
          title: "Jasper's Fanfiction Spot",
          subtitle: 'Create, import, branch, and continue stories',
          series: []
        };

    const engine = new CYOA.StoryEngine(bundle);
    await engine.ready();
    await engine.loadHostedJson().catch(() => []);
    window.JASPER_CYOA = engine;
    window.JasperFanfictionApp = { engine };

    const appShell = document.getElementById('appShell');
    const leftContent = document.getElementById('leftContent');
    const rightContent = document.getElementById('rightContent');
    const sidePanel = document.getElementById('sidePanel');
    const sideTitle = document.getElementById('sideTitle');
    const sideCount = document.getElementById('sideCount');
    const chapterIndex = document.getElementById('chapterIndex');
    const branchJournal = document.getElementById('branchJournal');
    const journalEntries = document.getElementById('journalEntries');
    const readerToolbar = document.getElementById('readerToolbar');
    const searchInput = document.getElementById('searchInput');
    const soundButton = document.getElementById('soundButton');
    const zoomLabel = document.getElementById('zoomLabel');
    const pageFooter = document.getElementById('pageFooter');
    const footerStatus = document.getElementById('footerStatus');
    const rightPageNumber = document.getElementById('rightPageNumber');
    const pageFlipAudio = document.getElementById('pageFlipAudio');
    const book = document.getElementById('book');
    const bookZoomFrame = document.getElementById('bookZoomFrame');

    if (!appShell || !leftContent || !rightContent) {
      document.body.innerHTML = '<main class="fallback-error"><h1>Reader shell is incomplete.</h1><p>The JavaScript loaded, but the expected book-page elements are missing from index.html.</p></main>';
      return;
    }

    configurePageFlipAudio();

    const state = {
      route: null,
      search: '',
      sound: true,
      zoom: (() => { try { return Math.max(.5, Math.min(3, Number(localStorage.getItem('jasper-book-zoom')) || 1)); } catch (_error) { return 1; } })(),
      privateReturn: null,
      busy: false,
      message: '',
      lastRoute: (() => { try { return localStorage.getItem('jasper-last-route') || ''; } catch (_error) { return ''; } })(),
      chapterPage: 0
    };
    document.documentElement.style.setProperty('--book-zoom', state.zoom.toFixed(2));
    if (zoomLabel) zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = '.json,application/json';
    importInput.multiple = true;
    importInput.hidden = true;
    document.body.appendChild(importInput);

    const folderInput = document.createElement('input');
    folderInput.type = 'file';
    folderInput.accept = '.json,application/json';
    folderInput.multiple = true;
    folderInput.hidden = true;
    folderInput.setAttribute('webkitdirectory', '');
    folderInput.setAttribute('directory', '');
    document.body.appendChild(folderInput);

    function escapeHtml(value) { return escapeHtmlStatic(value); }

    function paragraphs(text) {
      return String(text || '').split(/\n\s*\n/).filter(Boolean).map(paragraph => {
        return `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`;
      }).join('');
    }

    function currentSeries() { return state.route ? engine.getSeries(state.route) : null; }
    function currentChapter() { return state.route ? engine.current(state.route) : null; }

    function currentIndex() {
      const series = currentSeries();
      const chapter = currentChapter();
      return series && chapter ? series.chapters.findIndex(item => item.id === chapter.id) : -1;
    }

    function routeAccent(series) { appShell.dataset.route = series ? series.key : ''; }

    function configurePageFlipAudio() {
      if (!pageFlipAudio) return;
      pageFlipAudio.volume = 0.18;
      pageFlipAudio.playbackRate = 0.88;
      if ('preservesPitch' in pageFlipAudio) pageFlipAudio.preservesPitch = true;
      if ('mozPreservesPitch' in pageFlipAudio) pageFlipAudio.mozPreservesPitch = true;
    }

    function playFlip() {
      if (state.sound && pageFlipAudio) {
        configurePageFlipAudio();
        pageFlipAudio.currentTime = 0;
        pageFlipAudio.play().catch(() => {});
      }
      if (book) {
        book.classList.remove('is-turning');
        void book.offsetWidth;
        book.classList.add('is-turning');
        window.setTimeout(() => book.classList.remove('is-turning'), 560);
      }
    }

    function isPortraitReader() {
      return window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
    }

    function updateBookZoomFrame() {
      if (!book || !bookZoomFrame) return;
      const outer = bookZoomFrame.parentElement;
      if (!outer) return;
      const footerHeight = pageFooter && !pageFooter.hidden ? pageFooter.getBoundingClientRect().height : 0;
      const availableWidth = Math.max(240, outer.clientWidth - 16);
      const availableHeight = Math.max(240, outer.clientHeight - footerHeight - 16);
      const portrait = isPortraitReader();
      const aspect = portrait ? (668 / 1047) : (1336 / 1047);
      const designMax = portrait ? 620 : 1120;
      const fittedWidth = Math.max(240, Math.min(designMax, availableWidth, availableHeight * aspect));

      book.style.width = `${Math.floor(fittedWidth)}px`;
      book.style.aspectRatio = portrait ? '668 / 1047' : '1336 / 1047';

      window.requestAnimationFrame(() => {
        const width = book.offsetWidth;
        const height = book.offsetHeight;
        if (!width || !height) return;
        bookZoomFrame.style.width = `${Math.ceil(width * state.zoom)}px`;
        bookZoomFrame.style.height = `${Math.ceil(height * state.zoom)}px`;
      });
    }

    function scheduleFitPageContent() {
      window.requestAnimationFrame(() => window.requestAnimationFrame(updateBookZoomFrame));
    }

    function paginateChapterText(text, targetWords = 220) {
      const rawParagraphs = String(text || '').split(/\n\s*\n/).map(item => item.trim()).filter(Boolean);
      if (!rawParagraphs.length) return [''];
      const pieces = [];
      rawParagraphs.forEach(paragraph => {
        const words = paragraph.split(/\s+/).filter(Boolean);
        if (words.length <= targetWords) {
          pieces.push(paragraph);
          return;
        }
        const sentences = paragraph.match(/[^.!?]+[.!?]+(?:["'’”]+)?|[^.!?]+$/g) || [paragraph];
        let part = [];
        let count = 0;
        sentences.forEach(sentence => {
          const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean).length;
          if (part.length && count + sentenceWords > targetWords) {
            pieces.push(part.join(' ').trim());
            part = [];
            count = 0;
          }
          if (sentenceWords > targetWords) {
            const longWords = sentence.trim().split(/\s+/);
            for (let i = 0; i < longWords.length; i += targetWords) {
              if (part.length) {
                pieces.push(part.join(' ').trim());
                part = [];
                count = 0;
              }
              pieces.push(longWords.slice(i, i + targetWords).join(' '));
            }
          } else {
            part.push(sentence.trim());
            count += sentenceWords;
          }
        });
        if (part.length) pieces.push(part.join(' ').trim());
      });

      const pages = [];
      let current = [];
      let words = 0;
      pieces.forEach(piece => {
        const count = piece.split(/\s+/).filter(Boolean).length;
        if (current.length && words + count > targetWords) {
          pages.push(current.join('\n\n'));
          current = [];
          words = 0;
        }
        current.push(piece);
        words += count;
      });
      if (current.length) pages.push(current.join('\n\n'));
      return pages.length ? pages : [''];
    }

    function chapterWordTarget() {
      const portrait = isPortraitReader();
      const bookWidth = Math.max(240, book?.offsetWidth || (portrait ? window.innerWidth * .9 : window.innerWidth * .72));
      const bookHeight = Math.max(240, book?.offsetHeight || (bookWidth / (portrait ? (668 / 1047) : (1336 / 1047))));
      const pageWidth = portrait ? bookWidth : (bookWidth / 2);
      const fontPx = portrait ? 11.5 : (window.innerWidth <= 980 ? 10.5 : 11.5);
      const usableWidth = Math.max(120, pageWidth - 30);
      const usableHeight = Math.max(150, bookHeight - 92);
      const wordsPerLine = usableWidth / (fontPx * 3.3);
      const lines = usableHeight / (fontPx * 1.45);
      return Math.max(70, Math.min(240, Math.floor(wordsPerLine * lines * .82)));
    }

    function currentChapterPages(chapter = currentChapter()) {
      return chapter ? paginateChapterText(chapter.content, chapterWordTarget()) : [''];
    }

    function setStatus(message) {
      state.message = message || '';
      if (footerStatus && message) footerStatus.textContent = message;
    }

    function privateKey() {
      const chapter = currentChapter();
      return chapter && state.route ? `jasper-private-${state.route}-${chapter.id}` : '';
    }

    function savePrivateText(text) {
      const key = privateKey();
      if (!key) return;
      try { localStorage.setItem(key, text); } catch (_error) {}
    }

    function loadPrivateText() {
      const key = privateKey();
      if (!key) return '';
      try { return localStorage.getItem(key) || ''; } catch (_error) { return ''; }
    }

    function totalWords(series) {
      return series ? series.chapters.reduce((sum, chapter) => sum + CYOA.wordCount(chapter.content), 0) : 0;
    }

    function folderLabel() {
      return engine.hasProjectFolder() ? 'Project folder connected' : 'Connect project folder';
    }

    function toolsMarkup() {
      const hasLast = Boolean(state.lastRoute && engine.getSeries(state.lastRoute));
      return `
        <div class="home-actions" aria-label="Fanfiction tools">
          <button class="home-action home-action-create" type="button" data-action="create-story">Create Fanfic</button>
          <button class="home-action" type="button" data-action="resume-last" ${hasLast ? '' : 'disabled'}>Resume</button>
          <button class="home-action" type="button" data-action="save-last" ${hasLast ? '' : 'disabled'}>Save</button>
          <button class="home-action" type="button" data-action="import-json">Import</button>
          <button class="home-action" type="button" data-action="import-folder">Folder</button>
          <button class="home-action" type="button" data-action="connect-folder">${escapeHtml(engine.hasProjectFolder() ? 'Folder ✓' : 'Connect')}</button>
        </div>`;
    }

    function openBook() {
      appShell.classList.add('is-open', 'is-home');
      appShell.classList.remove('is-reading');
      renderHome();
    }

    function closeBook() {
      state.route = null;
      renderHome();
      appShell.classList.remove('is-open', 'is-reading');
      appShell.classList.add('is-home');
    }

    function routeCard(series) {
      const generatedCount = series.chapters.filter(chapter => chapter.generated).length;
      const resume = engine.memory(series.key)?.state.currentId ? ' · resume' : '';
      const routeClass = CYOA.slug(series.fandom_folder || series.fandom || series.key);
      return `<button class="route-button route-${escapeHtml(routeClass)}" type="button" data-route="${escapeHtml(series.key)}">
        <span class="route-kicker">${escapeHtml(series.fandom)}</span>
        <strong>${escapeHtml(series.title)}</strong>
        <span>${escapeHtml(series.pairing || 'Interactive fanfiction')} · ${series.chapters.length} ch.${generatedCount ? ` · ${generatedCount} new` : ''}${resume}</span>
      </button>`;
    }

    function renderHome() {
      state.route = null;
      state.search = '';
      state.privateReturn = null;
      state.chapterPage = 0;
      if (searchInput) searchInput.value = '';
      appShell.classList.add('is-home');
      appShell.classList.remove('is-reading', 'show-left-page');
      routeAccent(null);
      if (readerToolbar) readerToolbar.hidden = true;
      if (pageFooter) pageFooter.hidden = true;
      if (sidePanel) sidePanel.hidden = true;

      const series = engine.listSeries();
      leftContent.innerHTML = `
        <div class="page-inner title-page home-page">
          <div class="home-intro">
            <div class="title-mark" aria-hidden="true">✦</div>
            <p class="series-kicker">Jasper's library</p>
            <h2>Jasper's<br>Fanfiction Spot</h2>
            <h3>Fanfic can branch, resume, and keep growing.</h3>
            ${toolsMarkup()}
          </div>
        </div>`;

      rightContent.innerHTML = `
        <div class="page-inner home-route-page">
          <div class="mobile-home-intro">
            <p class="series-kicker">Jasper's library</p>
            <h2>Jasper's Fanfiction Spot</h2>
            <h3>Fanfic can branch, resume, and keep growing.</h3>
            ${toolsMarkup()}
            <div class="ornament"></div>
          </div>
          <div class="running-head"><span>Fanfic</span><span>${series.length}</span></div>
          <div class="fanfic-picker-wrap">
            <details class="fanfic-picker" id="fanficPicker">
              <summary><span>Choose a Fanfic</span><span aria-hidden="true">▾</span></summary>
              <div class="fanfic-menu" aria-label="Choose a fanfiction">
                ${series.length ? series.map(routeCard).join('') : '<p class="empty-index">No fanfic loaded.</p>'}
              </div>
            </details>
          </div>
        </div>`;
      if (rightPageNumber) rightPageNumber.textContent = 'ii';
      bindDynamicButtons();
      scheduleFitPageContent();
    }

    function renderCreateStory() {
      appShell.classList.add('is-open', 'is-home');
      appShell.classList.remove('is-reading');
      if (readerToolbar) readerToolbar.hidden = true;
      if (sidePanel) sidePanel.hidden = true;
      leftContent.innerHTML = `
        <div class="page-inner title-page home-page">
          <div>
            <div class="title-mark" aria-hidden="true">✦</div>
            <p class="series-kicker">Create</p>
            <h2>New Fanfic</h2>
            <h3>Start a branchable story.</h3>
          </div>
        </div>`;
      rightContent.innerHTML = `
        <div class="page-inner private-page create-page">
          <div class="running-head"><span>Create Fanfic</span><span>CYOA</span></div>
          <div class="page-scroll chapter-scroll">
            <form id="createStoryForm" class="story-form">
              <label>Title<input name="title" required placeholder="Story title"></label>
              <label>Fandom<input name="fandom" required placeholder="Palia"></label>
              <label>Characters / pairing<input name="pairing" placeholder="Character / Adult Reader"></label>
              <label>Character personalities<textarea name="character_bible" required rows="5" placeholder="Voice, habits, history, boundaries, dynamics"></textarea></label>
              <label>Premise<textarea name="premise" class="private-editor" required rows="6" placeholder="What happens, where it starts, tone, conflict, must-have moments"></textarea></label>
              <label>Tone<input name="tone" placeholder="Slow burn, adventure, domestic, dark humor..."></label>
              <label>Continuity<textarea name="canon_window" rows="3" placeholder="Canon timing and facts to preserve"></textarea></label>
              <label>Story bible<textarea name="story_bible" rows="4" placeholder="Recurring facts, boundaries, locations, promises, injuries, items"></textarea></label>
              <label>Length<input name="target_words" type="number" min="600" max="10000" step="100" value="1800"></label>
              <label>Tags<input name="content_tags" placeholder="romance, slow burn, polyamory, adventure, explicit..."></label>
              <label>Default intimacy
                <select name="content_mode">
                  <option value="general">General</option>
                  <option value="romance" selected>Romance</option>
                  <option value="mature_on_page">Mature on-page</option>
                  <option value="explicit">Explicit</option>
                  <option value="explicit_detailed">Explicit + detailed</option>
                </select>
              </label>
              <label class="adult-check"><input name="adult_characters_confirmed" type="checkbox" value="yes"><span>All sexual characters in this story are adults (18+) and consenting.</span></label>
              <div class="form-actions">
                <button class="choice-button" type="submit">Generate Chapter 01</button>
                <button class="choice-button" type="button" data-action="home">Cancel</button>
              </div>
            </form>
          </div>
        </div>`;
      bindDynamicButtons();
      scheduleFitPageContent();
    }

    function renderStorySettings() {
      const series = currentSeries();
      if (!series) return;
      const contentMode = series.content_mode || 'romance';
      const tags = Array.isArray(series.content_tags) ? series.content_tags.join(', ') : '';
      rightContent.innerHTML = `
        <div class="page-inner private-page">
          <div class="running-head"><span>${escapeHtml(series.title)}</span><span>Generation settings</span></div>
          <div class="page-scroll chapter-scroll">
            <h2 class="chapter-title">Story settings</h2>
            <div class="ornament"></div>
            <form id="storySettingsForm" class="private-actions" style="display:grid;gap:.8rem">
              <label>Writing style
                <select name="style_mode">
                  <option value="story_adaptive" ${series.style_mode !== 'story_only' ? 'selected' : ''}>Adaptive + continuity</option>
                  <option value="story_only" ${series.style_mode === 'story_only' ? 'selected' : ''}>Existing chapters only</option>
                </select>
              </label>
              <label>Chapter length<input name="target_words" type="number" min="600" max="10000" step="100" value="${escapeHtml(String(series.target_words || 1600))}"></label>
              <label>Tone / genre<input name="tone" value="${escapeHtml(series.tone || '')}" placeholder="slow burn, domestic, adventure, grief, humor..."></label>
              <label>Story tags<input name="content_tags" value="${escapeHtml(tags)}" placeholder="romance, slow burn, polyamory, adventure, sensual..."></label>
              <label>Default intimacy
                <select name="content_mode">
                  <option value="general" ${contentMode === 'general' ? 'selected' : ''}>General</option>
                  <option value="romance" ${contentMode === 'romance' ? 'selected' : ''}>Romance</option>
                  <option value="mature_on_page" ${contentMode === 'mature_on_page' ? 'selected' : ''}>Mature on-page</option>
                  <option value="explicit" ${contentMode === 'explicit' ? 'selected' : ''}>Explicit</option>
                  <option value="explicit_detailed" ${contentMode === 'explicit_detailed' ? 'selected' : ''}>Explicit + detailed</option>
                </select>
              </label>
              <label style="display:flex;gap:.55rem;align-items:flex-start"><input name="adult_characters_confirmed" type="checkbox" value="yes" ${series.adult_characters_confirmed ? 'checked' : ''} style="width:auto;margin-top:.2rem"> <span>All sexual characters in this story are adults (18+) and consenting.</span></label>
              <label>Canon / continuity notes<textarea name="canon_window" rows="4">${escapeHtml(series.canon_window || '')}</textarea></label>
              <label>Story / character bible<textarea name="story_bible" rows="7">${escapeHtml(series.story_bible || '')}</textarea></label>
              <div class="private-actions">
                <button class="choice-button" type="submit">Save settings</button>
                <button class="choice-button private" type="button" data-action="cancel-story-settings">Cancel</button>
              </div>
            </form>
          </div>
        </div>`;
      bindDynamicButtons();
    }

    function renderIndex() {
      const series = currentSeries();
      if (!series || !chapterIndex) return;
      const chapter = currentChapter();
      if (sideTitle) sideTitle.textContent = series.title;
      if (sideCount) sideCount.textContent = `${series.chapters.length} chapters · ${totalWords(series).toLocaleString()} words`;
      const query = state.search.trim().toLowerCase();
      const visible = series.chapters.filter(item => {
        if (!query) return true;
        return `${item.title} ${item.subtitle} ${item.content}`.toLowerCase().includes(query);
      });
      chapterIndex.innerHTML = visible.length ? visible.map(item => {
        const current = item.id === chapter?.id;
        const generated = item.generated ? ' · generated' : '';
        return `<button class="index-link reader-chapter-link ${current ? 'is-current' : ''}" type="button" data-chapter-id="${escapeHtml(item.id)}">
          <span>${padDisplay(item.chapter_number)}. ${escapeHtml(item.title)}</span>
          <small>${CYOA.wordCount(item.content).toLocaleString()} words · ${item.choices.length} choices${generated}</small>
        </button>`;
      }).join('') : '<p class="empty-index">No chapter matches that search.</p>';
      chapterIndex.querySelectorAll('[data-chapter-id]').forEach(button => {
        button.addEventListener('click', () => openChapter(button.dataset.chapterId, true));
      });
    }

    function padDisplay(number) { return String(number || 0).padStart(2, '0'); }

    function renderJournal() {
      if (!branchJournal || !journalEntries) return;
      const journal = engine.getJournal(state.route);
      if (!journal.length) {
        branchJournal.hidden = true;
        journalEntries.innerHTML = '';
        return;
      }
      branchJournal.hidden = false;
      journalEntries.innerHTML = journal.slice(-10).map(entry => `<p class="journal-entry"><strong>${escapeHtml(entry.chapter || `Chapter ${entry.chapterNumber}`)}</strong><br>${escapeHtml(entry.choice)}</p>`).join('');
    }

    function qualitiesText() {
      const values = engine.getQualities(state.route);
      const entries = Object.entries(values).filter(([, value]) => value !== 0 && value != null);
      if (!entries.length) return 'No branch qualities recorded yet.';
      return entries.slice(0, 8).map(([key, value]) => `${key}: ${value}`).join(' · ');
    }

    function renderLeftPage() {
      const series = currentSeries();
      const chapter = currentChapter();
      if (!series || !chapter) return;
      const generatedCount = series.chapters.filter(item => item.generated).length;
      const canUndo = engine.canUndo(state.route);
      const branches = engine.listBranches(state.route);
      const branchList = branches.length
        ? branches.slice(0, 12).map(branch => `<button class="branch-button" type="button" data-restore-branch="${escapeHtml(branch.id)}"><strong>${escapeHtml(branch.label)}</strong><br><span>${escapeHtml(branch.chapterNumber ? `Chapter ${branch.chapterNumber}` : 'Saved branch')}</span></button>`).join('')
        : '<span class="branch-empty">No saved branches yet.</span>';
      leftContent.innerHTML = `
        <div class="page-inner reader-contents page-safe-scroll">
          <div class="running-head"><span>${escapeHtml(series.title)}</span><span>${padDisplay(chapter.chapter_number)} / ${series.chapters.length}</span></div>
          <div class="reader-contents-copy">
            <p class="series-kicker">${escapeHtml(series.fandom)}</p>
            <h2>${escapeHtml(series.pairing || series.title)}</h2>
            <div class="reader-stats"><span><strong>${series.chapters.length}</strong> chapters</span><span><strong>${totalWords(series).toLocaleString()}</strong> words</span><span><strong>${generatedCount}</strong> generated</span></div>
          </div>
          <div class="path-card"><strong>Branch state</strong><span>${escapeHtml(qualitiesText())}</span></div>
          <div class="path-card branch-card" id="branchControls">
            <strong>Save & revisit</strong>
            <div class="branch-actions">
              <button class="choice-button" type="button" data-action="save-progress">Save</button>
              <button class="choice-button" type="button" data-action="undo" ${canUndo ? '' : 'disabled'}>Undo</button>
              <button class="choice-button" type="button" data-action="save-branch">Bookmark</button>
            </div>
            <div class="branch-list" aria-label="Saved branches">${branchList}</div>
          </div>
          <div class="path-card settings-card">
            <strong>Future chapters</strong>
            <span>${escapeHtml((series.content_mode || 'romance').replace(/_/g, ' '))} · ${Number(series.target_words || 1600).toLocaleString()} words</span>
            <button class="choice-button" type="button" data-action="story-settings">Settings</button>
          </div>
        </div>`;
    }

    function choiceMarkup(choice) {
      const privateClass = String(choice.target || '').startsWith('@generate-explicit') ? ' explicit' : '';
      const effect = choice.effect && Object.keys(choice.effect).length
        ? `<small>${escapeHtml(Object.entries(choice.effect).map(([key, value]) => `${key} ${typeof value === 'number' && value >= 0 ? '+' : ''}${value}`).join(' · '))}</small>`
        : '';
      return `<button class="choice-button${privateClass}" type="button" data-choice="${escapeHtml(choice.id)}">
        <span class="choice-label">${escapeHtml(choice.label)}</span>
        <span class="choice-description">${escapeHtml(choice.description || '')}</span>
        ${effect}
      </button>`;
    }

    function renderChapter() {
      const series = currentSeries();
      const chapter = currentChapter();
      if (!series || !chapter) return renderHome();
      renderLeftPage();
      renderIndex();
      renderJournal();
      updateBookZoomFrame();

      const textPages = currentChapterPages(chapter);
      const decisionPage = textPages.length;
      state.chapterPage = Math.max(0, Math.min(state.chapterPage, decisionPage));
      const atDecision = state.chapterPage === decisionPage;
      const totalReaderPages = textPages.length + 1;
      const displayPage = state.chapterPage + 1;
      const choices = engine.availableChoices(chapter);
      const bridge = engine.getEntryBridge(state.route);

      if (!atDecision) {
        const pageText = textPages[state.chapterPage] || '';
        rightContent.innerHTML = `
          <div class="page-inner chapter-page">
            <div class="running-head"><span>${escapeHtml(series.title)}</span><span>Chapter ${chapter.chapter_number} · ${displayPage}/${totalReaderPages}</span></div>
            <div class="page-scroll chapter-scroll">
              <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
              <p class="chapter-meta">${escapeHtml(chapter.subtitle || '')}${chapter.generated ? ' · generated continuation' : ''}</p>
              <div class="ornament"></div>
              ${bridge && state.chapterPage === 0 ? `<div class="path-card carry-card"><strong>Carried forward</strong><span>${escapeHtml(bridge)}</span></div>` : ''}
              <div class="story-body">${paragraphs(pageText)}</div>
            </div>
          </div>`;
      } else {
        rightContent.innerHTML = `
          <div class="page-inner chapter-page decision-leaf">
            <div class="running-head"><span>${escapeHtml(series.title)}</span><span>Chapter ${chapter.chapter_number} · choice</span></div>
            <div class="page-scroll chapter-scroll decision-scroll">
              <h2 class="chapter-title">${series.story_type === 'short_story' ? 'The End' : 'What happens next?'}</h2>
              <div class="ornament"></div>
              ${series.story_type === 'short_story' ? `
                <div class="choice-grid">
                  <button class="choice-button" type="button" data-action="home"><span class="choice-label">Fanfic library</span></button>
                  <button class="choice-button" type="button" data-action="create-story"><span class="choice-label">Create another</span></button>
                </div>` : `
                <div class="choice-grid">${choices.length ? choices.map(choiceMarkup).join('') : `
                  <button class="choice-button" type="button" data-action="continue-story">
                    <span class="choice-label">Continue this branch</span>
                    <span class="choice-description">Generate the next chapter.</span>
                  </button>`}</div>`}
            </div>
          </div>`;
      }

      if (rightPageNumber) rightPageNumber.textContent = `${chapter.chapter_number}.${displayPage}`;
      if (footerStatus) footerStatus.textContent = `${series.title} · Ch ${chapter.chapter_number} · page ${displayPage}/${totalReaderPages}`;
      if (pageFooter) pageFooter.hidden = false;
      bindDynamicButtons();
      updateNavButtons();
      scheduleFitPageContent();
    }

    function renderEnding() {
      const series = currentSeries();
      const chapter = currentChapter();
      if (!series || !chapter) return;
      renderLeftPage();
      rightContent.innerHTML = `
        <div class="page-inner ending-page-wrap">
          <div class="running-head"><span>Current end of written JSON</span><span>✦</span></div>
          <div class="page-scroll chapter-scroll ending-page">
            <h2 class="chapter-title">Keep going.</h2>
            <div class="ornament"></div>
            <p>Chapter ${chapter.chapter_number} is the current end of this branch.</p>
            <div class="ending-actions">
              <button class="choice-button" type="button" data-action="continue-story">Continue this branch</button>
              <button class="choice-button" type="button" data-action="connect-folder">${escapeHtml(folderLabel())}</button>
              <button class="choice-button" type="button" data-action="export-generated">Export generated JSON</button>
              <button class="choice-button" type="button" data-action="restart">Restart this route</button>
              <button class="choice-button private" type="button" data-action="home">Return to story library</button>
            </div>
          </div>
        </div>`;
      if (rightPageNumber) rightPageNumber.textContent = '→';
      if (footerStatus) footerStatus.textContent = `${series.title} · ready to continue after chapter ${chapter.chapter_number}`;
      bindDynamicButtons();
      updateNavButtons(true);
    }

    function updateNavButtons(ending) {
      const series = currentSeries();
      const chapter = currentChapter();
      const index = currentIndex();
      const pages = chapter ? currentChapterPages(chapter) : [''];
      const atFirstLeaf = state.chapterPage <= 0;
      const atDecision = state.chapterPage >= pages.length;
      document.querySelectorAll('[data-action="previous"]').forEach(button => {
        button.disabled = !series || Boolean(ending) || (atFirstLeaf && index <= 0);
      });
      document.querySelectorAll('[data-action="next"]').forEach(button => {
        button.disabled = !series || Boolean(ending) || atDecision;
      });
      document.querySelectorAll('[data-action="undo"]').forEach(button => {
        button.disabled = !series || !engine.canUndo(state.route);
      });
    }

    function openRoute(key, restart) {
      if (!engine.getSeries(key)) return;
      state.route = key;
      state.lastRoute = key;
      try { localStorage.setItem('jasper-last-route', key); } catch (_error) {}
      state.search = '';
      state.privateReturn = null;
      state.chapterPage = 0;
      if (searchInput) searchInput.value = '';
      engine.start(key, { restart: Boolean(restart) });
      appShell.classList.add('is-open');
      appShell.classList.remove('is-home');
      appShell.classList.add('is-reading');
      routeAccent(engine.getSeries(key));
      if (readerToolbar) readerToolbar.hidden = false;
      if (sidePanel) sidePanel.hidden = window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
      appShell.classList.remove('show-left-page');
      playFlip();
      renderChapter();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openChapter(id, announce) {
      const series = currentSeries();
      if (!series) return;
      const chapter = engine.openChapter(state.route, id, { record: true });
      if (!chapter) return;
      state.privateReturn = null;
      state.chapterPage = 0;
      if (announce) playFlip();
      renderChapter();
      const page = document.querySelector('.chapter-scroll');
      if (page) page.scrollTop = 0;
    }

    async function withBusy(label, fn) {
      if (state.busy) return null;
      state.busy = true;
      document.querySelectorAll('button').forEach(button => { if (!button.disabled) button.dataset.wasEnabled = '1'; button.disabled = true; });
      setStatus(label || 'Working…');
      try {
        const result = await fn();
        return result;
      } catch (error) {
        console.error(error);
        setStatus(error?.message || 'Something went wrong while progressing the story.');
        return null;
      } finally {
        state.busy = false;
        document.querySelectorAll('button[data-was-enabled="1"]').forEach(button => { button.disabled = false; delete button.dataset.wasEnabled; });
      }
    }

    async function chooseChoice(choiceId) {
      const result = await withBusy('Following that branch…', () => engine.choose(choiceId));
      if (!result) return;
      playFlip();
      if (result.type === 'ending') {
        renderJournal();
        renderEnding();
        return;
      }
      if (result.type === 'chapter') {
        state.chapterPage = 0;
        renderChapter();
        const projectMessage = result.generated
          ? (engine.hasProjectFolder() ? 'New branch chapter generated and written to JSON.' : 'New branch chapter generated and saved in browser JSON storage.')
          : '';
        if (projectMessage) setStatus(projectMessage);
      }
    }

    async function continueStory(direction) {
      const chapter = await withBusy('Creating the next chapter from the current branch…', () => engine.continueStory(direction || 'continue'));
      if (!chapter) return;
      playFlip();
      state.chapterPage = 0;
      renderChapter();
      setStatus(engine.hasProjectFolder()
        ? `Chapter ${chapter.chapter_number} generated and written to json/${currentSeries().series_path}/${padDisplay(chapter.chapter_number)}.json.`
        : `Chapter ${chapter.chapter_number} generated and saved. Connect the project folder to write future chapters directly into json/${currentSeries().series_path}/.`);
    }

    function previousChapter() {
      const series = currentSeries();
      const index = currentIndex();
      if (!series) return;
      if (state.chapterPage > 0) {
        state.chapterPage -= 1;
        playFlip();
        renderChapter();
        return;
      }
      if (index <= 0) return;
      const previous = series.chapters[index - 1];
      const chapter = engine.openChapter(state.route, previous.id, { record: true });
      if (!chapter) return;
      state.chapterPage = Math.max(0, currentChapterPages(chapter).length - 1);
      playFlip();
      renderChapter();
    }

    function nextChapter() {
      const chapter = currentChapter();
      if (!chapter) return;
      const pages = currentChapterPages(chapter);
      if (state.chapterPage < pages.length) {
        state.chapterPage += 1;
        playFlip();
        renderChapter();
      }
    }

    function saveProgress() {
      if (!state.route) return;
      engine.saveProgress(state.route);
      setStatus('Progress saved in this browser.');
      if (currentChapter()) {
        renderLeftPage();
        bindDynamicButtons();
      }
    }

    function undoDecision() {
      if (!state.route) return;
      const branch = engine.undo(state.route);
      if (!branch) {
        setStatus('There is no choice to undo yet.');
        return;
      }
      state.privateReturn = null;
      state.chapterPage = 0;
      playFlip();
      renderChapter();
      setStatus(`Undid ${branch.choiceLabel ? `“${branch.choiceLabel}”` : 'the last choice'}. The branch remains available below.`);
    }

    function saveBranch() {
      if (!state.route) return;
      const chapter = currentChapter();
      const defaultLabel = chapter ? `Bookmark at chapter ${chapter.chapter_number}` : 'Saved branch';
      const label = typeof window.prompt === 'function' ? window.prompt('Name this branch', defaultLabel) : defaultLabel;
      if (label === null) return;
      const branch = engine.createBranch(String(label || defaultLabel).trim() || defaultLabel, state.route);
      if (branch) {
        renderLeftPage();
        bindDynamicButtons();
        setStatus(`Saved branch “${branch.label}”.`);
      }
    }

    function restoreBranch(branchId) {
      if (!state.route) return;
      const branch = engine.restoreBranch(branchId, state.route);
      if (!branch) return;
      state.privateReturn = null;
      state.chapterPage = 0;
      playFlip();
      renderChapter();
      setStatus(`Returned to “${branch.label}”.`);
    }

    async function connectProjectFolder() {
      await withBusy('Connecting the project folder…', async () => {
        await engine.connectProjectFolder();
        setStatus('Project folder connected. New fanfic files will write to json/<Fandom>/<Dashed-Story-Name>/, with missing folders created automatically.');
      });
      if (state.route) renderChapter(); else renderHome();
    }

    async function handleImport(files) {
      const list = [...(files || [])].filter(file => String(file.name || '').toLowerCase().endsWith('.json'));
      if (!list.length) return;
      await withBusy(`Importing ${list.length} JSON file${list.length === 1 ? '' : 's'}…`, async () => {
        await engine.importFiles(list);
        setStatus(`${list.length} JSON file${list.length === 1 ? '' : 's'} read. Partial stories can now resume from their existing chapters.`);
      });
      renderHome();
    }

    async function submitCreateStory(form) {
      const data = new FormData(form);
      const requestedMode = String(data.get('content_mode') || 'romance');
      const adultConfirmed = data.get('adult_characters_confirmed') === 'yes';
      const adultOnly = ['mature_on_page', 'explicit', 'explicit_detailed'].includes(requestedMode);
      const spec = {
        title: data.get('title'),
        fandom: data.get('fandom'),
        story_type: data.get('story_type') || 'cyoa_fanfiction',
        pairing: data.get('pairing'),
        character_bible: String(data.get('character_bible') || '').split(/\n\s*\n|\n(?=[^\s])/).map(value => value.trim()).filter(Boolean),
        premise: data.get('premise'),
        canon_window: data.get('canon_window'),
        story_bible: data.get('story_bible'),
        tone: data.get('tone'),
        style_mode: data.get('style_mode') || 'story_adaptive',
        target_words: Number(data.get('target_words') || (data.get('story_type') === 'short_story' ? 2500 : 1600)),
        content_tags: String(data.get('content_tags') || '').split(',').map(value => value.trim()).filter(Boolean),
        content_mode: requestedMode,
        adult_characters_confirmed: adultConfirmed,
        consenting_adults_confirmed: adultConfirmed
      };
      if (adultOnly && !adultConfirmed) {
        setStatus('Confirm that every sexual character is an adult (18+) and consenting before using an adult-only mode.');
        return;
      }
      const created = await withBusy(spec.story_type === 'short_story' ? 'Generating the short story…' : 'Generating the opening chapter…', () => engine.createStory(spec));
      if (!created) return;
      state.route = created.series.key;
      appShell.classList.add('is-open');
      appShell.classList.remove('is-home');
      appShell.classList.add('is-reading');
      routeAccent(created.series);
      if (readerToolbar) readerToolbar.hidden = false;
      if (sidePanel) sidePanel.hidden = false;
      renderChapter();
      setStatus(engine.hasProjectFolder()
        ? `New ${created.series.story_type === 'short_story' ? 'short story' : 'fanfic'} created and written to json/${created.series.series_path}/01.json.`
        : `New ${created.series.story_type === 'short_story' ? 'short story' : 'fanfic'} created in browser storage. Connect the project folder to create json/${created.series.series_path}/ and its files directly.`);
    }

    function submitStorySettings(form) {
      const data = new FormData(form);
      const requestedMode = String(data.get('content_mode') || 'romance');
      const adultConfirmed = data.get('adult_characters_confirmed') === 'yes';
      if (['mature_on_page', 'explicit', 'explicit_detailed'].includes(requestedMode) && !adultConfirmed) {
        setStatus('Confirm that every sexual character is an adult (18+) and consenting before using an adult-only mode.');
        return;
      }
      engine.configureSeries(state.route, {
        style_mode: data.get('style_mode') || 'story_adaptive',
        target_words: Number(data.get('target_words') || 1600),
        tone: data.get('tone') || '',
        content_tags: String(data.get('content_tags') || '').split(',').map(value => value.trim()).filter(Boolean),
        content_mode: requestedMode,
        adult_characters_confirmed: adultConfirmed,
        canon_window: data.get('canon_window') || '',
        story_bible: data.get('story_bible') || ''
      });
      renderChapter();
      setStatus('Settings saved.');
    }

    function bindDynamicButtons() {
      document.querySelectorAll('[data-route]').forEach(button => {
        button.onclick = () => openRoute(button.dataset.route, false);
      });
      document.querySelectorAll('[data-choice]').forEach(button => {
        button.onclick = () => chooseChoice(button.dataset.choice);
      });
      document.querySelectorAll('[data-restore-branch]').forEach(button => {
        button.onclick = () => restoreBranch(button.dataset.restoreBranch);
      });
      document.querySelectorAll('[data-action="restart"]').forEach(button => {
        button.onclick = () => openRoute(state.route, true);
      });
      const form = document.getElementById('createStoryForm');
      if (form) form.onsubmit = event => { event.preventDefault(); submitCreateStory(form); };
      const settingsForm = document.getElementById('storySettingsForm');
      if (settingsForm) settingsForm.onsubmit = event => { event.preventDefault(); submitStorySettings(settingsForm); };
      scheduleFitPageContent();
    }

    document.addEventListener('click', event => {
      const actionButton = event.target.closest('[data-action]');
      if (!actionButton || actionButton.dataset.choice || actionButton.dataset.privateAction) return;
      const action = actionButton.dataset.action;
      if (action === 'open-book') openBook();
      if (action === 'cover') closeBook();
      if (action === 'home') renderHome();
      if (action === 'contents' && sidePanel) {
        if (window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches) {
          sidePanel.hidden = !sidePanel.hidden;
          if (!sidePanel.hidden) sidePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          sidePanel.hidden = false;
          sidePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      if (action === 'previous') previousChapter();
      if (action === 'next') nextChapter();
      if (action === 'continue-story') continueStory('continue');
      if (action === 'create-story') renderCreateStory();
      if (action === 'save-progress') saveProgress();
      if (action === 'undo') undoDecision();
      if (action === 'save-branch') saveBranch();
      if (action === 'branches') {
        if (window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches) {
          appShell.classList.toggle('show-left-page');
        } else {
          document.getElementById('branchControls')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      if (action === 'story-settings') renderStorySettings();
      if (action === 'cancel-story-settings') renderChapter();
      if (action === 'import-json') importInput.click();
      if (action === 'import-folder') folderInput.click();
      if (action === 'connect-folder') connectProjectFolder();
      if (action === 'export-generated') {
        const count = engine.exportGenerated(state.route);
        setStatus(count ? `Exported ${count} generated chapter JSON file${count === 1 ? '' : 's'}.` : 'There are no generated chapters to export yet.');
      }
      if (action === 'resume-last') {
        const key = state.lastRoute && engine.getSeries(state.lastRoute) ? state.lastRoute : engine.listSeries()[0]?.key;
        if (key) openRoute(key, false);
      }
      if (action === 'save-last') {
        const key = state.lastRoute && engine.getSeries(state.lastRoute) ? state.lastRoute : '';
        if (key) {
          engine.saveProgress(key);
          setStatus('Saved.');
        }
      }
      if (action === 'sound') {
        state.sound = !state.sound;
        if (soundButton) soundButton.textContent = `Sound: ${state.sound ? 'on' : 'off'}`;
      }
      if (action === 'smaller' || action === 'larger') {
        state.zoom = Math.round(Math.max(.5, Math.min(3, state.zoom + (action === 'larger' ? .1 : -.1))) * 100) / 100;
        try { localStorage.setItem('jasper-book-zoom', String(state.zoom)); } catch (_error) {}
        document.documentElement.style.setProperty('--book-zoom', state.zoom.toFixed(2));
        if (zoomLabel) zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
        scheduleFitPageContent();
      }
    });

    importInput.addEventListener('change', () => {
      handleImport(importInput.files);
      importInput.value = '';
    });
    folderInput.addEventListener('change', () => {
      handleImport(folderInput.files);
      folderInput.value = '';
    });
    if (searchInput) searchInput.addEventListener('input', event => {
      state.search = event.target.value;
      if (state.route) renderIndex();
    });
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      scheduleFitPageContent();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (state.route && appShell.classList.contains('is-reading')) renderChapter();
      }, 140);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFitPageContent).catch(() => {});

    document.addEventListener('cyoa:generated', event => {
      const detail = event.detail || {};
      if (detail.project?.written) setStatus(`Generated JSON written to ${detail.project.filename}.`);
    });

    renderHome();
  }
}());
