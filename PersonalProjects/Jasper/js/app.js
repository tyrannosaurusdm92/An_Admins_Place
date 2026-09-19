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

    if (!appShell || !leftContent || !rightContent) {
      document.body.innerHTML = '<main class="fallback-error"><h1>Reader shell is incomplete.</h1><p>The JavaScript loaded, but the expected book-page elements are missing from index.html.</p></main>';
      return;
    }

    configurePageFlipAudio();

    const state = {
      route: null,
      search: '',
      sound: true,
      zoom: 1,
      privateReturn: null,
      busy: false,
      message: ''
    };

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

    function fitPageContent() {
      const pages = [leftContent, rightContent]
        .map(content => content && content.closest('.page'))
        .filter((page, index, list) => page && list.indexOf(page) === index);

      pages.forEach(page => {
        const inner = page.querySelector('.page-inner');
        const pageRect = page.getBoundingClientRect();
        if (!inner || !pageRect.width || !pageRect.height) return;

        // Reset before measuring so a previous fit does not compound on the next one.
        inner.style.setProperty('--page-fit-scale', '1');
        const innerRect = inner.getBoundingClientRect();
        let requiredHeight = innerRect.height;
        let requiredWidth = innerRect.width;

        inner.querySelectorAll('*').forEach(node => {
          const rect = node.getBoundingClientRect();
          if (!rect.width && !rect.height) return;
          requiredHeight = Math.max(requiredHeight, rect.bottom - innerRect.top + 2);
          requiredWidth = Math.max(requiredWidth, rect.right - innerRect.left + 2);
        });

        const availableHeight = Math.max(1, pageRect.height - 10);
        const availableWidth = Math.max(1, pageRect.width - 10);
        const measuredScale = Math.min(1, availableHeight / requiredHeight, availableWidth / requiredWidth);
        const scale = Number.isFinite(measuredScale) ? Math.max(.01, Math.min(1, measuredScale)) : 1;
        inner.style.setProperty('--page-fit-scale', scale.toFixed(3));
      });
    }

    function scheduleFitPageContent() {
      window.requestAnimationFrame(() => window.requestAnimationFrame(fitPageContent));
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
      return `
        <div class="private-actions cyoa-file-actions">
          <button class="choice-button" type="button" data-action="import-json">Import JSON files</button>
          <button class="choice-button" type="button" data-action="import-folder">Import JSON folder</button>
          <button class="choice-button" type="button" data-action="connect-folder">${escapeHtml(folderLabel())}</button>
          <button class="choice-button private" type="button" data-action="create-story">Create Fanfic</button>
          <button class="choice-button" type="button" data-action="cover">Close book</button>
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
      const resume = engine.memory(series.key)?.state.currentId ? ' · resume available' : '';
      const routeClass = CYOA.slug(series.fandom_folder || series.fandom || series.key);
      return `<button class="route-button route-${escapeHtml(routeClass)}" type="button" data-route="${escapeHtml(series.key)}">
        <span class="route-kicker">${escapeHtml(series.fandom)}</span>
        <strong>${escapeHtml(series.title)}</strong>
        <span>${escapeHtml(series.pairing || (series.story_type === 'short_story' ? 'Standalone short story' : 'Interactive fanfiction'))} · ${series.chapters.length} chapter${series.chapters.length === 1 ? '' : 's'}${generatedCount ? ` · ${generatedCount} generated` : ''}${resume}</span>
      </button>`;
    }

    function renderHome() {
      state.route = null;
      state.search = '';
      state.privateReturn = null;
      if (searchInput) searchInput.value = '';
      appShell.classList.add('is-home');
      appShell.classList.remove('is-reading');
      routeAccent(null);
      if (readerToolbar) readerToolbar.hidden = true;
      if (pageFooter) pageFooter.hidden = true;
      if (sidePanel) sidePanel.hidden = true;

      const series = engine.listSeries();
      leftContent.innerHTML = `
        <div class="page-inner title-page home-page">
          <div>
            <div class="title-mark" aria-hidden="true">✦</div>
            <p class="series-kicker">A branching fanfiction library</p>
            <h2>Jasper's<br>Fanfiction Spot</h2>
            <h3>Fanfic can branch, resume, and keep growing.</h3>
            <p class="byline">Existing JSON remains usable as the beginning of a longer story.</p>
          </div>
        </div>`;

      rightContent.innerHTML = `
        <div class="page-inner home-route-page">
          <div class="running-head"><span>Fanfic index</span><span>✦</span></div>
          <div class="home-route-copy">
            <h2>${series.length ? 'Where should the story open?' : 'Start with a story or existing JSON'}</h2>
            <p>${series.length
              ? 'Every choice now records branch state. Existing chapters stay readable, and any route can continue past the last JSON chapter.'
              : 'No bundled JSON is required. Import partial chapter files or create a story here; the engine can generate the opening and continue from whatever chapters exist.'}</p>
          </div>
          <div class="route-grid" aria-label="Choose a fanfiction route">
            ${series.length ? series.map(routeCard).join('') : '<p class="reader-note">No story routes are loaded yet.</p>'}
          </div>
          ${toolsMarkup()}
          <p class="reader-note"><strong>Generated story files:</strong> each new chapter is saved immediately in browser storage. When a project folder is connected, JavaScript creates <code>json/&lt;Fandom&gt;/&lt;Dashed-Story-Name&gt;/</code> as needed, writes chapter JSON there, and updates that story's <code>series.json</code> plus the root catalog.</p>
        </div>`;
      if (rightPageNumber) rightPageNumber.textContent = 'ii';
      bindDynamicButtons();
    }

    function renderCreateStory() {
      appShell.classList.add('is-open');
      appShell.classList.add('is-home');
      appShell.classList.remove('is-reading');
      if (readerToolbar) readerToolbar.hidden = true;
      if (sidePanel) sidePanel.hidden = true;
      leftContent.innerHTML = `
        <div class="page-inner title-page home-page">
          <div>
            <div class="title-mark" aria-hidden="true">✦</div>
            <p class="series-kicker">Create fanfic</p>
            <h2>Build the story Jasper wants.</h2>
            <p class="byline">Create a branching fanfic opening or a complete adult short story from the premise and character personalities.</p>
          </div>
        </div>`;
      rightContent.innerHTML = `
        <div class="page-inner private-page">
          <div class="running-head"><span>Create fanfic</span><span>JSON + CYOA</span></div>
          <div class="page-scroll chapter-scroll">
            <h2 class="chapter-title">Story seed</h2>
            <div class="ornament"></div>
            <form id="createStoryForm" class="private-actions" style="display:grid;gap:.8rem">
              <label>Story title<input name="title" required placeholder="Story title"></label>
              <label>Fandom / game / world<input name="fandom" required placeholder="Palia"></label>
              <label>Story format
                <select name="story_type">
                  <option value="cyoa_fanfiction" selected>Choose-your-own-adventure fanfiction</option>
                  <option value="short_story">Standalone short story</option>
                </select>
              </label>
              <label>Main characters / pairing<input name="pairing" placeholder="Character / Adult Reader"></label>
              <label>Character personalities<textarea name="character_bible" required rows="7" placeholder="Describe each character's personality, voice, habits, boundaries, history, relationship dynamics, and how they should behave. One character per paragraph works well."></textarea></label>
              <label>Story description / premise<textarea name="premise" class="private-editor" required rows="8" placeholder="Describe the kind of fanfic Jasper wants, where it begins, the relationship setup, conflict, mood, and any must-have moments."></textarea></label>
              <label>Genre / tone<input name="tone" placeholder="Slow burn, adventure, domestic, dark humor, hurt/comfort..."></label>
              <label>Canon window / continuity notes<textarea name="canon_window" rows="4" placeholder="Optional canon timing, setting, and facts that must stay true"></textarea></label>
              <label>Extra story bible<textarea name="story_bible" rows="5" placeholder="Recurring facts, boundaries, locations, promises, injuries, items, relationship rules, etc."></textarea></label>
              <label>Writing style
                <select name="style_mode">
                  <option value="story_adaptive" selected>Adaptive story style + route continuity</option>
                  <option value="story_only">Infer only from imported/existing chapters</option>
                </select>
              </label>
              <label>Approximate length<input name="target_words" type="number" min="600" max="10000" step="100" value="1800"></label>
              <label>Story tags<input name="content_tags" placeholder="romance, slow burn, polyamory, adventure, explicit..."></label>
              <label>Romance / intimacy level
                <select name="content_mode">
                  <option value="general">General</option>
                  <option value="romance" selected>Romance / non-explicit</option>
                  <option value="mature_on_page">Mature on-page</option>
                  <option value="explicit">Explicit — adults only</option>
                  <option value="explicit_detailed">Explicit + detailed — adults only</option>
                </select>
              </label>
              <label style="display:flex;gap:.55rem;align-items:flex-start"><input name="adult_characters_confirmed" type="checkbox" value="yes" style="width:auto;margin-top:.2rem"> <span>Every romantic or sexual participant is an adult (18+) and consenting in this story.</span></label>
              <p class="reader-note">CYOA fanfic ends generated chapters with meaningful choices. Standalone short-story mode returns one complete story with no branch buttons. Explicit modes are routed only when adult/consent confirmation is enabled and require a configured text-generation provider.</p>
              <div class="private-actions">
                <button class="choice-button" type="submit">Generate chapter 01</button>
                <button class="choice-button private" type="button" data-action="home">Cancel</button>
              </div>
            </form>
          </div>
        </div>`;
      bindDynamicButtons();
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
            <h2 class="chapter-title">How should future chapters be written?</h2>
            <div class="ornament"></div>
            <form id="storySettingsForm" class="private-actions" style="display:grid;gap:.8rem">
              <label>Writing style
                <select name="style_mode">
                  <option value="story_adaptive" ${series.style_mode !== 'story_only' ? 'selected' : ''}>Adaptive story style + route continuity</option>
                  <option value="story_only" ${series.style_mode === 'story_only' ? 'selected' : ''}>Infer only from this story's existing chapters</option>
                </select>
              </label>
              <label>Approximate chapter length<input name="target_words" type="number" min="600" max="10000" step="100" value="${escapeHtml(String(series.target_words || 1600))}"></label>
              <label>Tone / genre<input name="tone" value="${escapeHtml(series.tone || '')}" placeholder="slow burn, domestic, adventure, grief, humor..."></label>
              <label>Story tags<input name="content_tags" value="${escapeHtml(tags)}" placeholder="romance, slow burn, polyamory, adventure, sensual..."></label>
              <label>Romance / intimacy level
                <select name="content_mode">
                  <option value="general" ${contentMode === 'general' ? 'selected' : ''}>General</option>
                  <option value="romance" ${contentMode === 'romance' ? 'selected' : ''}>Romance / non-explicit</option>
                  <option value="mature_on_page" ${contentMode === 'mature_on_page' ? 'selected' : ''}>Mature on-page</option>
                  <option value="explicit" ${contentMode === 'explicit' ? 'selected' : ''}>Explicit — adults only</option>
                  <option value="explicit_detailed" ${contentMode === 'explicit_detailed' ? 'selected' : ''}>Explicit + detailed — adults only</option>
                </select>
              </label>
              <label style="display:flex;gap:.55rem;align-items:flex-start"><input name="adult_characters_confirmed" type="checkbox" value="yes" ${series.adult_characters_confirmed ? 'checked' : ''} style="width:auto;margin-top:.2rem"> <span>Every romantic or sexual participant is an adult (18+) and consenting in this story.</span></label>
              <label>Canon / continuity notes<textarea name="canon_window" rows="4">${escapeHtml(series.canon_window || '')}</textarea></label>
              <label>Story / character bible<textarea name="story_bible" rows="7">${escapeHtml(series.story_bible || '')}</textarea></label>
              <p class="reader-note">These settings affect newly generated chapters. Existing JSON chapters are not rewritten. Explicit modes require a configured text-generation provider.</p>
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
        ? branches.slice(0, 12).map(branch => `<button class="branch-button" type="button" data-restore-branch="${escapeHtml(branch.id)}"><strong>${escapeHtml(branch.label)}</strong><br><span>${escapeHtml(branch.chapterNumber ? `Chapter ${branch.chapterNumber}` : 'Saved branch')} · ${escapeHtml(branch.kind === 'manual' ? 'bookmark' : 'decision branch')}</span></button>`).join('')
        : '<span class="branch-empty">Choices will create return points automatically.</span>';
      leftContent.innerHTML = `
        <div class="page-inner reader-contents">
          <div class="running-head"><span>${escapeHtml(series.title)}</span><span>${padDisplay(chapter.chapter_number)} / ${series.chapters.length}</span></div>
          <div class="reader-contents-copy">
            <p class="series-kicker">${escapeHtml(series.fandom)}</p>
            <h2>${escapeHtml(series.pairing || series.title)}</h2>
            <p>${escapeHtml(series.description || series.premise || '')}</p>
            <div class="reader-stats"><span><strong>${series.chapters.length}</strong> chapters</span><span><strong>${totalWords(series).toLocaleString()}</strong> words</span><span><strong>${generatedCount}</strong> generated</span></div>
          </div>
          <div class="ornament"></div>
          <div class="path-card">
            <strong>Branch state</strong>
            <span>${escapeHtml(qualitiesText())}</span>
          </div>
          <div class="path-card branch-card" id="branchControls">
            <strong>Save and revisit</strong>
            <span>Progress saves automatically. Each choice keeps a return point, and a bookmark can be named for later.</span>
            <div class="branch-actions">
              <button class="choice-button" type="button" data-action="save-progress">Save progress</button>
              <button class="choice-button" type="button" data-action="undo" ${canUndo ? '' : 'disabled'}>Undo choice</button>
              <button class="choice-button" type="button" data-action="save-branch">Save branch</button>
            </div>
            <div class="branch-list" aria-label="Saved branches">${branchList}</div>
          </div>
          <div class="path-card private-card">
            <strong>Continuation engine</strong>
            <span>Missing targets and end-of-story continuation generate new JSON chapters instead of hard-stopping.</span>
          </div>
          <div class="path-card">
            <strong>Generation settings</strong>
            <span>${escapeHtml((series.style_mode || 'story_adaptive').replace(/_/g, ' '))} · ${escapeHtml((series.content_mode || 'romance').replace(/_/g, ' '))} · ${Number(series.target_words || 1600).toLocaleString()} target words</span>
            <button class="choice-button" type="button" data-action="story-settings" style="margin-top:.6rem">Change story settings</button>
          </div>
          <p class="left-prompt">Choices are remembered and become continuity context for later generated chapters.</p>
        </div>`;
    }

    function choiceMarkup(choice) {
      const privateClass = choice.target === 'private' || choice.target === '@private' ? ' private' : '';
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
      const choices = engine.availableChoices(chapter);
      const bridge = engine.getEntryBridge(state.route);
      rightContent.innerHTML = `
        <div class="page-inner chapter-page">
          <div class="running-head"><span>${escapeHtml(series.title)}</span><span>Chapter ${chapter.chapter_number} of ${series.chapters.length}</span></div>
          <div class="page-scroll chapter-scroll">
            <h2 class="chapter-title">${escapeHtml(chapter.title)}</h2>
            <p class="chapter-meta">${escapeHtml(chapter.subtitle || '')} · ${CYOA.wordCount(chapter.content).toLocaleString()} words${chapter.generated ? ' · generated continuation' : ''}${chapter.content_mode ? ` · ${escapeHtml(chapter.content_mode.replace(/_/g, ' '))}` : ''}</p>
            <div class="ornament"></div>
            ${bridge ? `<div class="path-card"><strong>What I carried into this chapter</strong><span>${escapeHtml(bridge)}</span></div>` : ''}
            <div class="story-body">${paragraphs(chapter.content)}</div>
            ${series.story_type === 'short_story' ? `
            <section class="choice-panel" aria-labelledby="choice-heading">
              <h3 id="choice-heading">Short story complete</h3>
              <p class="choice-intro">This story was created as a standalone work, so it intentionally has no CYOA branch choices.</p>
              <div class="choice-grid">
                <button class="choice-button" type="button" data-action="home"><span class="choice-label">Back to fanfiction library</span></button>
                <button class="choice-button" type="button" data-action="create-story"><span class="choice-label">Create another fanfic</span></button>
              </div>
            </section>` : `
            <section class="choice-panel" aria-labelledby="choice-heading">
              <h3 id="choice-heading">What do I choose?</h3>
              <p class="choice-intro">The engine remembers the branch, applies its effects, and uses that path when it continues the story.</p>
              <div class="choice-grid">${choices.length ? choices.map(choiceMarkup).join('') : `
                <button class="choice-button" type="button" data-action="continue-story">
                  <span class="choice-label">Continue the story</span>
                  <span class="choice-description">Create the next chapter from this chapter's continuity and save it as new JSON.</span>
                </button>`}</div>
            </section>`}
          </div>
          <span class="page-number">${chapter.chapter_number}</span>
        </div>`;
      if (rightPageNumber) rightPageNumber.textContent = String(chapter.chapter_number);
      if (footerStatus) footerStatus.textContent = `${series.title} · ${chapter.chapter_number} / ${series.chapters.length}${chapter.generated ? ' · generated' : ''}`;
      if (pageFooter) pageFooter.hidden = false;
      bindDynamicButtons();
      updateNavButtons();
    }

    function renderPrivate(returnTo) {
      const series = currentSeries();
      const chapter = currentChapter();
      if (!series || !chapter) return;
      state.privateReturn = returnTo || '@generate';
      const saved = loadPrivateText();
      rightContent.innerHTML = `
        <div class="page-inner private-page">
          <div class="running-head"><span>Private continuation seed</span><span>Local draft</span></div>
          <div class="page-scroll chapter-scroll">
            <p class="series-kicker">${escapeHtml(series.title)} · after chapter ${chapter.chapter_number}</p>
            <h2 class="chapter-title">Write the door open</h2>
            <div class="ornament"></div>
            <p class="private-lead">This draft stays in local browser storage. You can simply return, or use it as hidden continuity context for a newly generated JSON chapter.</p>
            <textarea id="privateTextarea" class="private-editor" spellcheck="true" placeholder="Continue the scene in your own words…">${escapeHtml(saved)}</textarea>
            <p class="reader-note"><strong>Privacy:</strong> the private draft itself is not copied into the chapter JSON. If you choose “continue from this,” only the resulting generated chapter is persisted.</p>
            <div class="private-actions">
              <button class="choice-button" type="button" data-private-action="continue">Save privately and continue from this</button>
              <button class="choice-button" type="button" data-private-action="save-return">Save privately and return</button>
              <button class="choice-button private" type="button" data-private-action="return">Return without saving</button>
            </div>
          </div>
          <span class="page-number">private</span>
        </div>`;
      if (rightPageNumber) rightPageNumber.textContent = '✦';
      bindDynamicButtons();
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
            <h2 class="chapter-title">The story does not have to stop here.</h2>
            <div class="ornament"></div>
            <p>Chapter ${chapter.chapter_number} is the current end of this branch. The engine can use the chapters, branch history, relationship qualities, and selected path as continuity to create the next JSON chapter.</p>
            <p class="reader-note">Generated chapters are stored immediately. ${engine.hasProjectFolder() ? 'A project folder is connected, so new JSON also writes into the story folder.' : 'Connect the project root once if you want new JSON written directly into <code>json/' + escapeHtml(series.series_path) + '/</code>.'}</p>
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
      const index = currentIndex();
      document.querySelectorAll('[data-action="previous"]').forEach(button => {
        button.disabled = !series || index <= 0 || Boolean(ending);
      });
      document.querySelectorAll('[data-action="next"]').forEach(button => {
        button.disabled = !series || Boolean(ending);
      });
      document.querySelectorAll('[data-action="undo"]').forEach(button => {
        button.disabled = !series || !engine.canUndo(state.route);
      });
    }

    function openRoute(key, restart) {
      if (!engine.getSeries(key)) return;
      state.route = key;
      state.search = '';
      state.privateReturn = null;
      if (searchInput) searchInput.value = '';
      engine.start(key, { restart: Boolean(restart) });
      appShell.classList.add('is-open');
      appShell.classList.remove('is-home');
      appShell.classList.add('is-reading');
      routeAccent(engine.getSeries(key));
      if (readerToolbar) readerToolbar.hidden = false;
      if (sidePanel) sidePanel.hidden = false;
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
      if (result.type === 'private') {
        renderPrivate(result.returnTo);
        return;
      }
      if (result.type === 'ending') {
        renderJournal();
        renderEnding();
        return;
      }
      if (result.type === 'chapter') {
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
      renderChapter();
      setStatus(engine.hasProjectFolder()
        ? `Chapter ${chapter.chapter_number} generated and written to json/${currentSeries().series_path}/${padDisplay(chapter.chapter_number)}.json.`
        : `Chapter ${chapter.chapter_number} generated and saved. Connect the project folder to write future chapters directly into json/${currentSeries().series_path}/.`);
    }

    function previousChapter() {
      const series = currentSeries();
      const index = currentIndex();
      if (!series || index <= 0) return;
      openChapter(series.chapters[index - 1].id, true);
    }

    function nextChapter() {
      const series = currentSeries();
      const index = currentIndex();
      if (!series) return;
      if (index >= 0 && index < series.chapters.length - 1) openChapter(series.chapters[index + 1].id, true);
      else renderEnding();
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
        setStatus('Adult-only intimacy modes require confirming that every romantic or sexual participant is an adult and consenting. The story will use romance / non-explicit mode instead.');
        spec.content_mode = 'romance';
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
      const updated = engine.configureSeries(state.route, {
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
      if (['mature_on_page', 'explicit', 'explicit_detailed'].includes(requestedMode) && updated.content_mode !== requestedMode) {
        setStatus('Settings saved. The adult-only mode was reduced to romance because consenting adult status was not confirmed.');
      } else {
        setStatus('Story-generation settings saved for future chapters.');
      }
    }

    function bindDynamicButtons() {
      document.querySelectorAll('[data-route]').forEach(button => {
        button.onclick = () => openRoute(button.dataset.route, false);
      });
      document.querySelectorAll('[data-choice]').forEach(button => {
        button.onclick = () => chooseChoice(button.dataset.choice);
      });
      document.querySelectorAll('[data-private-action]').forEach(button => {
        button.onclick = async () => {
          const textarea = document.getElementById('privateTextarea');
          const text = textarea ? textarea.value : '';
          const action = button.dataset.privateAction;
          if (action === 'continue') {
            savePrivateText(text);
            const chapter = await withBusy('Continuing from the private draft…', () => engine.continueFromPrivate(text, '@generate'));
            if (chapter) {
              playFlip();
              renderChapter();
              setStatus(`Continued into chapter ${chapter.chapter_number}; the private draft itself stayed local.`);
            }
            return;
          }
          if (action === 'save-return') savePrivateText(text);
          const returnTo = state.privateReturn;
          state.privateReturn = null;
          if (returnTo && returnTo !== 'ending' && !String(returnTo).startsWith('@generate')) openChapter(returnTo, false);
          else renderEnding();
        };
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
      if (action === 'contents' && sidePanel) sidePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (action === 'previous') previousChapter();
      if (action === 'next') nextChapter();
      if (action === 'continue-story') continueStory('continue');
      if (action === 'create-story') renderCreateStory();
      if (action === 'save-progress') saveProgress();
      if (action === 'undo') undoDecision();
      if (action === 'save-branch') saveBranch();
      if (action === 'branches') document.getElementById('branchControls')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (action === 'story-settings') renderStorySettings();
      if (action === 'cancel-story-settings') renderChapter();
      if (action === 'import-json') importInput.click();
      if (action === 'import-folder') folderInput.click();
      if (action === 'connect-folder') connectProjectFolder();
      if (action === 'export-generated') {
        const count = engine.exportGenerated(state.route);
        setStatus(count ? `Exported ${count} generated chapter JSON file${count === 1 ? '' : 's'}.` : 'There are no generated chapters to export yet.');
      }
      if (action === 'sound') {
        state.sound = !state.sound;
        if (soundButton) soundButton.textContent = `Sound: ${state.sound ? 'on' : 'off'}`;
      }
      if (action === 'smaller' || action === 'larger') {
        const nextZoom = state.zoom + (action === 'larger' ? .1 : -.1);
        state.zoom = Math.round(Math.max(.5, Math.min(3, nextZoom)) * 100) / 100;
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
    window.addEventListener('resize', scheduleFitPageContent);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFitPageContent).catch(() => {});

    document.addEventListener('cyoa:generated', event => {
      const detail = event.detail || {};
      if (detail.project?.written) setStatus(`Generated JSON written to ${detail.project.filename}.`);
    });

    renderHome();
  }
}());
