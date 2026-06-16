(function(){
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const STORE_KEY = 'an-admins-place-project-v1';
  const DEFAULT_CATALOG_PATH = 'data/module-catalog.json';
  const ADAPTERS_PATH = 'data/source-repository-adapters.json';
  const WIX_ADAPTERS_PATH = 'data/wix-module-adapters.json';
  const RPG_ADAPTERS_PATH = 'data/rpg-tool-module-adapters.json';
  const SCANNER_ADAPTERS_PATH = 'data/scanner-generator-module-adapters.json';
  const SETTLEMENT_ADAPTERS_PATH = 'data/settlement-location-module-adapters.json';
  const EXPANDED_ADAPTERS_PATH = 'data/expanded-site-builder-module-adapters.json';

  const state = {
    catalog: null,
    adapters: null,
    wixAdapters: null,
    rpgAdapters: null,
    scannerAdapters: null,
    settlementAdapters: null,
    expandedAdapters: null,
    modules: [],
    selectedId: null,
    zoom: 1,
    grid: false,
    snap: true,
    activePageId: 'home',
    project: {
      name: 'My Admin Place Project',
      slug: 'my-admin-place-project',
      pageTitle: 'My Project',
      description: 'A project made in An Admin\'s Place.',
      canvasWidth: 1200,
      canvasHeight: 820,
      backendUrl: '',
      themeColor: '#6ff7ff',
      accentColor: '#ff8fe7',
      globalCss: 'body{font-family:system-ui,sans-serif;}',
      pages: [{id:'home', title:'Home', slug:'index'}]
    }
  };

  const els = {};
  const fallbackCatalog = {
    appName: "An Admin's Place",
    modules: [
      {type:'hero', category:'Wix-style building blocks', label:'Hero / Landing Section', repoSource:'native editor', defaultSize:{w:720,h:300}, html:"<section class='site-hero'><h1 contenteditable='true'>Build anything from here</h1><p contenteditable='true'>Drag modules in, edit, import code, and export.</p></section>", css:".site-hero{height:100%;padding:2rem;border-radius:20px;background:rgba(255,255,255,.1)}", js:''},
      {type:'rich_text', category:'Wix-style building blocks', label:'Editable Text Box', repoSource:'native editor', defaultSize:{w:420,h:220}, html:"<article><h2 contenteditable='true'>Editable text</h2><p contenteditable='true'>Type here.</p></article>", css:'article{height:100%;padding:1rem}', js:''},
      {type:'code_import', category:'Code/import tools', label:'Custom Code Module', repoSource:'code-modules-main', defaultSize:{w:520,h:360}, html:"<section><h3>Custom code</h3><pre>&lt;!-- import code --&gt;</pre></section>", css:'section{height:100%;padding:1rem}', js:''}
    ]
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    cacheEls();
    await loadCatalogs();
    bindUI();
    normalizePages();
    hydrateProjectForm();
    renderPageControls();
    applyCanvasSize();
    renderPalette();
    renderRepoList();
    makeStarterProject();
    setStatus('projectStatus', 'Ready. Start from the starter layout or create a new blank project.', 'good');
  }

  function cacheEls(){
    Object.assign(els, {
      canvas: $('#canvas'), emptyState: $('#emptyState'), pageLabel: $('#pageLabel'), scroller: $('#workspaceScroller'),
      palette: $('#modulePalette'), moduleSearch: $('#moduleSearch'),
      newProjectBtn: $('#newProjectBtn'), saveProjectBtn: $('#saveProjectBtn'), loadProjectBtn: $('#loadProjectBtn'), importProjectBtn: $('#importProjectBtn'), previewBtn: $('#previewBtn'), exportZipBtn: $('#exportZipBtn'), exportZipBtn2: $('#exportZipBtn2'), exportEditorBtn: $('#exportEditorBtn'),
      gridToggleBtn: $('#gridToggleBtn'), snapToggleBtn: $('#snapToggleBtn'), centerBtn: $('#centerBtn'), zoomOutBtn: $('#zoomOutBtn'), zoomInBtn: $('#zoomInBtn'), zoomLabel: $('#zoomLabel'), deleteBtn: $('#deleteBtn'),
      noSelection: $('#noSelection'), inspectorForm: $('#inspectorForm'), inspectorStatus: $('#inspectorStatus'),
      propLabel: $('#propLabel'), propX: $('#propX'), propY: $('#propY'), propW: $('#propW'), propH: $('#propH'), propFont: $('#propFont'), propRadius: $('#propRadius'), propColor: $('#propColor'), propBg: $('#propBg'), propBgImage: $('#propBgImage'), propHref: $('#propHref'), propHtml: $('#propHtml'), propCss: $('#propCss'), propJs: $('#propJs'), propJson: $('#propJson'), propRunJs: $('#propRunJs'),
      duplicateBtn: $('#duplicateBtn'), removeModuleBtn: $('#removeModuleBtn'), applyHtmlBtn: $('#applyHtmlBtn'), codeFileInput: $('#codeFileInput'),
      projectName: $('#projectName'), projectSlug: $('#projectSlug'), pageTitle: $('#pageTitle'), canvasWidth: $('#canvasWidth'), canvasHeight: $('#canvasHeight'), pageSelect: $('#pageSelect'), addPageBtn: $('#addPageBtn'), deletePageBtn: $('#deletePageBtn'), pageTitleEdit: $('#pageTitleEdit'), renamePageBtn: $('#renamePageBtn'), pageStatus: $('#pageStatus'), projectDescription: $('#projectDescription'), backendUrl: $('#backendUrl'), themeColor: $('#themeColor'), accentColor: $('#accentColor'), globalCss: $('#globalCss'),
      includeBackend: $('#includeBackend'), includeEditorData: $('#includeEditorData'), includeAdminNotes: $('#includeAdminNotes'), exportStatus: $('#exportStatus'), projectStatus: $('#projectStatus'), repoList: $('#repoList'), modalRoot: $('#modalRoot')
    });
  }

  async function loadCatalogs(){
    try{
      const res = await fetch(DEFAULT_CATALOG_PATH, {cache:'no-store'});
      if(!res.ok) throw new Error(res.statusText);
      state.catalog = await res.json();
    }catch(err){
      state.catalog = fallbackCatalog;
    }
    try{
      const res = await fetch(ADAPTERS_PATH, {cache:'no-store'});
      state.adapters = res.ok ? await res.json() : {repositories:[]};
    }catch(err){ state.adapters = {repositories:[]}; }
    try{
      const res = await fetch(WIX_ADAPTERS_PATH, {cache:'no-store'});
      state.wixAdapters = res.ok ? await res.json() : {added_modules:[], repositories:[]};
    }catch(err){ state.wixAdapters = {added_modules:[], repositories:[]}; }
    try{
      const res = await fetch(RPG_ADAPTERS_PATH, {cache:'no-store'});
      state.rpgAdapters = res.ok ? await res.json() : {added_modules:[], repositories:[]};
    }catch(err){ state.rpgAdapters = {added_modules:[], repositories:[]}; }
    try{
      const res = await fetch(SCANNER_ADAPTERS_PATH, {cache:'no-store'});
      state.scannerAdapters = res.ok ? await res.json() : {added_modules:[], repositories:[]};
    }catch(err){ state.scannerAdapters = {added_modules:[], repositories:[]}; }
    try{
      const res = await fetch(SETTLEMENT_ADAPTERS_PATH, {cache:'no-store'});
      state.settlementAdapters = res.ok ? await res.json() : {added_modules:[], repositories:[]};
    }catch(err){ state.settlementAdapters = {added_modules:[], repositories:[]}; }
    try{
      const res = await fetch(EXPANDED_ADAPTERS_PATH, {cache:'no-store'});
      state.expandedAdapters = res.ok ? await res.json() : {added_modules:[], repositories:[]};
    }catch(err){ state.expandedAdapters = {added_modules:[], repositories:[]}; }
  }

  function bindUI(){
    els.moduleSearch.addEventListener('input', renderPalette);
    els.newProjectBtn.addEventListener('click', ()=>confirmNewProject());
    els.saveProjectBtn.addEventListener('click', saveLocal);
    els.loadProjectBtn.addEventListener('click', loadLocal);
    els.importProjectBtn.addEventListener('click', importProjectJson);
    els.previewBtn.addEventListener('click', openPreview);
    els.exportZipBtn.addEventListener('click', exportProjectZip);
    els.exportZipBtn2.addEventListener('click', exportProjectZip);
    els.exportEditorBtn.addEventListener('click', exportEditorBackup);
    els.gridToggleBtn.addEventListener('click', toggleGrid);
    els.snapToggleBtn.addEventListener('click', toggleSnap);
    els.centerBtn.addEventListener('click', centerWorkspace);
    els.zoomOutBtn.addEventListener('click', ()=>setZoom(state.zoom - .1));
    els.zoomInBtn.addEventListener('click', ()=>setZoom(state.zoom + .1));
    els.deleteBtn.addEventListener('click', deleteSelected);
    els.pageSelect?.addEventListener('change', ()=>setActivePage(els.pageSelect.value));
    els.addPageBtn?.addEventListener('click', addPageFromPrompt);
    els.deletePageBtn?.addEventListener('click', deleteActivePage);
    els.renamePageBtn?.addEventListener('click', renameActivePage);
    els.duplicateBtn.addEventListener('click', duplicateSelected);
    els.removeModuleBtn.addEventListener('click', deleteSelected);
    els.applyHtmlBtn.addEventListener('click', applyHtmlToSelected);
    els.codeFileInput.addEventListener('change', importFilesToSelected);
    els.canvas.addEventListener('dragover', e=>{e.preventDefault();});
    els.canvas.addEventListener('drop', onCanvasDrop);
    els.canvas.addEventListener('pointerdown', e=>{ if(e.target === els.canvas) selectModule(null); });
    document.addEventListener('keydown', onKeydown);
    $$('.tab').forEach(tab => tab.addEventListener('click', ()=>activateTab(tab.dataset.tab)));

    ['propLabel','propX','propY','propW','propH','propFont','propRadius','propColor','propBg','propBgImage','propHref','propCss','propJs','propJson','propRunJs'].forEach(id=>{
      const el = els[id];
      el.addEventListener('input', updateSelectedFromInspector);
      el.addEventListener('change', updateSelectedFromInspector);
    });
    ['projectName','projectSlug','pageTitle','canvasWidth','canvasHeight','projectDescription','backendUrl','themeColor','accentColor','globalCss'].forEach(id=>{
      const el = els[id];
      el.addEventListener('input', updateProjectFromForm);
      el.addEventListener('change', updateProjectFromForm);
    });
  }

  function renderPalette(){
    const q = (els.moduleSearch.value || '').trim().toLowerCase();
    els.palette.innerHTML = '';
    const modules = (state.catalog.modules || []).filter(m => !q || [m.label,m.category,m.repoSource,m.type].join(' ').toLowerCase().includes(q));
    const byCat = new Map();
    for(const mod of modules){
      if(!byCat.has(mod.category)) byCat.set(mod.category, []);
      byCat.get(mod.category).push(mod);
    }
    if(!modules.length){
      els.palette.innerHTML = `<div class="help-card"><h3>No matching modules</h3><p>Try searching for code, map, form, dice, Onyx, profile, PDF, or backend.</p></div>`;
      return;
    }
    for(const [cat, mods] of byCat){
      const title = document.createElement('div');
      title.className = 'cat-title';
      title.textContent = cat;
      els.palette.appendChild(title);
      for(const mod of mods){
        const card = document.createElement('div');
        card.className = 'module-card';
        card.draggable = true;
        card.dataset.type = mod.type;
        card.innerHTML = `<div><strong>${escapeHtml(mod.label)}</strong><em>${escapeHtml(mod.repoSource || 'native')}</em></div><button type="button">Add</button>`;
        card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', mod.type));
        card.querySelector('button').addEventListener('click', () => addModule(mod.type, viewportCenter()));
        els.palette.appendChild(card);
      }
    }
  }

  function renderRepoList(){
    if(!els.repoList) return;
    const groups = [
      ['Original repository adapters', state.adapters?.repositories || []],
      ['Wix source adapters', state.wixAdapters?.repositories || []],
      ['RPG / VTT / audio adapters', state.rpgAdapters?.repositories || []],
      ['Scanner / generator / randomizer adapters', state.scannerAdapters?.repositories || []],
      ['Settlement / DungeonFog / VTT adapters', state.settlementAdapters?.repositories || []],
      ['Expanded site builder / simulator / messenger adapters', state.expandedAdapters?.repositories || []]
    ];
    els.repoList.innerHTML = groups.map(([title,repos]) => {
      if(!repos.length) return '';
      return `<div class="cat-title">${escapeHtml(title)}</div>` + repos.map(r=>`<div class="repo-pill"><strong>${escapeHtml(r.archive || r.repoSource || 'source')}</strong><span>${escapeHtml(r.adapter || r.label || r.runtime || '')}</span></div>`).join('');
    }).join('');
  }

  function makeStarterProject(){
    if(localStorage.getItem(STORE_KEY)){
      loadLocal(false);
      return;
    }
    const starter = [
      ['hero', 70, 70],
      ['button_stack', 820, 90],
      ['code_import', 90, 430],
      ['gas_backend', 650, 470]
    ];
    starter.forEach(([type,x,y])=>addModule(type, {x,y}, false));
    selectModule(state.modules[0]?.id || null);
    renderModules();
  }

  function confirmNewProject(){
    const ok = state.modules.length === 0 || confirm('Start a blank project? Unsaved local changes in the editor will be cleared unless you saved them.');
    if(!ok) return;
    state.modules = [];
    state.selectedId = null;
    state.project = {
      name: 'Untitled Admin Place Project', slug: 'untitled-admin-place-project', pageTitle: 'Untitled Project', description: 'A project made in An Admin\'s Place.', canvasWidth: 1200, canvasHeight: 820, backendUrl: '', themeColor: '#6ff7ff', accentColor: '#ff8fe7', globalCss: 'body{font-family:system-ui,sans-serif;}'
    };
    normalizePages();
    hydrateProjectForm();
    renderPageControls();
    applyCanvasSize();
    renderModules();
    selectModule(null);
    setStatus('projectStatus','Blank project ready.', 'good');
  }

  function onCanvasDrop(e){
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if(!type) return;
    const rect = els.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    addModule(type, {x, y});
  }

  function viewportCenter(){
    const rect = els.canvas.getBoundingClientRect();
    const wrap = els.scroller.getBoundingClientRect();
    return {
      x: Math.max(20, (els.scroller.scrollLeft + wrap.width/2 - (rect.left - wrap.left)) / state.zoom - 180),
      y: Math.max(20, (els.scroller.scrollTop + wrap.height/2 - (rect.top - wrap.top)) / state.zoom - 120)
    };
  }

  function getTemplate(type){
    return (state.catalog.modules || []).find(m => m.type === type) || state.catalog.modules[0];
  }

  function addModule(type, pos={x:80,y:80}, shouldSelect=true){
    const t = getTemplate(type);
    const id = makeId(type);
    const w = Number(t.defaultSize?.w || 360);
    const h = Number(t.defaultSize?.h || 240);
    const mod = {
      id, type: t.type, label: t.label || type, pageId: state.activePageId || 'home',
      x: snap(pos.x || 80), y: snap(pos.y || 80), w, h,
      fontSize: 16, radius: 18,
      color: '#f7fbff', bg: '#101522', bgImage: '', href: '', collapsed: false, bubbleX: null, bubbleY: null, savedW: w, savedH: h, assets: [],
      html: t.html || '<div contenteditable="true">New module</div>',
      css: t.css || '', js: t.js || '', json: t.json || '{}', runJs: Boolean(t.js),
      repoSource: t.repoSource || 'native editor'
    };
    state.modules.push(mod);
    renderModules();
    if(shouldSelect) selectModule(id);
    return mod;
  }

  function renderModules(){
    $$('.ap-module', els.canvas).forEach(el => el.remove());
    const visibleModules = state.modules.filter(m => (m.pageId || 'home') === (state.activePageId || 'home'));
    els.emptyState.classList.toggle('hidden', visibleModules.length > 0);
    for(const mod of visibleModules){
      const el = document.createElement('div');
      el.className = 'ap-module show-toolbar-padding';
      el.dataset.id = mod.id;
      const viewX = mod.collapsed ? (mod.bubbleX ?? mod.x) : mod.x;
      const viewY = mod.collapsed ? (mod.bubbleY ?? mod.y) : mod.y;
      const viewW = mod.collapsed ? 75 : mod.w;
      const viewH = mod.collapsed ? 75 : mod.h;
      el.style.left = `${viewX}px`; el.style.top = `${viewY}px`;
      el.style.width = `${viewW}px`; el.style.height = `${viewH}px`;
      el.classList.toggle('collapsed-bubble', !!mod.collapsed);
      el.style.borderRadius = `${mod.radius}px`;
      el.style.color = mod.color || '#f7fbff';
      el.style.backgroundColor = mod.bg || 'transparent';
      if(mod.bgImage){
        el.style.backgroundImage = `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),url("${cssUrl(mod.bgImage)}")`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
      if(mod.fontSize) el.style.fontSize = `${mod.fontSize}px`;
      if(mod.id === state.selectedId) el.classList.add('selected');
      const toolbar = document.createElement('div');
      toolbar.className = 'module-toolbar';
      toolbar.innerHTML = `<span class="move-handle" title="Drag to move">↕ ${escapeHtml(mod.label)}</span><button type="button" data-collapse>${mod.collapsed ? 'open' : '☰'}</button><button type="button" data-select>edit</button>`;
      const content = document.createElement('div');
      content.className = 'module-content';
      content.innerHTML = mod.collapsed ? `<button class="bubble-open" type="button" title="Open ${escapeAttr(mod.label)}">☰</button>` : (mod.href ? `<a class="module-link-shell" href="${escapeAttr(mod.href)}">${mod.html}</a>` : mod.html);
      const handle = document.createElement('div');
      handle.className = 'resize-handle';
      el.append(toolbar, content, handle);
      els.canvas.appendChild(el);
      el.addEventListener('pointerdown', e=>{
        if(e.target.closest('.resize-handle') || e.target.closest('.move-handle') || e.target.closest('[data-select]') || e.target.closest('[data-collapse]') || e.target.closest('.bubble-open')) return;
        selectModule(mod.id);
      });
      toolbar.querySelector('[data-select]').addEventListener('click', () => selectModule(mod.id));
      toolbar.querySelector('[data-collapse]').addEventListener('click', () => toggleModuleCollapse(mod.id));
      const bubbleButton = content.querySelector('.bubble-open');
      if(bubbleButton) bubbleButton.addEventListener('click', () => toggleModuleCollapse(mod.id));
      toolbar.querySelector('.move-handle').addEventListener('pointerdown', e => startMove(e, mod.id));
      handle.addEventListener('pointerdown', e => startResize(e, mod.id));
      const gameInput = content.querySelector('[data-ap-game-upload]');
      if(gameInput) gameInput.addEventListener('change', e => importGameFilesToModule(mod, Array.from(e.target.files || [])));
      content.addEventListener('input', () => {
        // Direct text edits update the module HTML. If a link shell was generated, store inner HTML of the shell.
        const shell = content.querySelector('.module-link-shell');
        mod.html = shell ? shell.innerHTML : content.innerHTML;
        if(state.selectedId === mod.id) els.propHtml.value = mod.html;
      });
    }
    runEditorPreviewScripts();
  }

  function runEditorPreviewScripts(){
    // Only execute trusted template scripts from the catalog, not arbitrary imported custom JS.
    const scripts = new Set((state.catalog.modules || []).map(m => m.js).filter(Boolean));
    for(const code of scripts){
      try{ new Function(code)(); }catch(err){ console.warn('Template preview script failed', err); }
    }
  }

  function selectModule(id){
    state.selectedId = id;
    $$('.ap-module', els.canvas).forEach(el => el.classList.toggle('selected', el.dataset.id === id));
    const mod = selectedModule();
    els.noSelection.classList.toggle('hidden', !!mod);
    els.inspectorForm.classList.toggle('hidden', !mod);
    if(!mod) return;
    els.propLabel.value = mod.label || '';
    els.propX.value = Math.round(mod.x); els.propY.value = Math.round(mod.y);
    els.propW.value = Math.round(mod.w); els.propH.value = Math.round(mod.h);
    els.propFont.value = mod.fontSize || 16; els.propRadius.value = mod.radius || 0;
    els.propColor.value = toHex(mod.color || '#f7fbff'); els.propBg.value = toHex(mod.bg || '#101522');
    els.propBgImage.value = mod.bgImage || ''; els.propHref.value = mod.href || '';
    els.propHtml.value = mod.html || ''; els.propCss.value = mod.css || ''; els.propJs.value = mod.js || '';
    els.propJson.value = mod.json || '{}'; els.propRunJs.checked = !!mod.runJs;
    setStatus('inspectorStatus', `Selected ${mod.label} from ${mod.repoSource}.`, 'good');
  }

  function selectedModule(){ return state.modules.find(m => m.id === state.selectedId) || null; }

  function updateSelectedFromInspector(e){
    const mod = selectedModule();
    if(!mod) return;
    mod.label = els.propLabel.value || mod.type;
    mod.x = snap(Number(els.propX.value || 0)); mod.y = snap(Number(els.propY.value || 0));
    mod.w = Math.max(60, Number(els.propW.value || 60)); mod.h = Math.max(50, Number(els.propH.value || 50));
    mod.fontSize = Number(els.propFont.value || 16); mod.radius = Number(els.propRadius.value || 0);
    mod.color = els.propColor.value || '#f7fbff'; mod.bg = els.propBg.value || '#101522'; mod.bgImage = els.propBgImage.value.trim(); mod.href = els.propHref.value.trim();
    mod.css = els.propCss.value; mod.js = els.propJs.value; mod.json = els.propJson.value; mod.runJs = els.propRunJs.checked;
    if(e && e.target === els.propJson){
      try{ JSON.parse(mod.json || '{}'); setStatus('inspectorStatus','JSON is valid.', 'good'); }
      catch(err){ setStatus('inspectorStatus','JSON is not valid yet: '+err.message, 'warn'); }
    }
    renderModules();
    selectModule(mod.id);
  }

  function applyHtmlToSelected(){
    const mod = selectedModule();
    if(!mod) return;
    mod.html = els.propHtml.value;
    renderModules();
    selectModule(mod.id);
    setStatus('inspectorStatus', 'HTML applied to selected module.', 'good');
  }

  async function importFilesToSelected(){
    const mod = selectedModule();
    const files = Array.from(els.codeFileInput.files || []);
    if(!mod || !files.length) return;
    for(const file of files){
      const text = await file.text();
      const lower = file.name.toLowerCase();
      if(lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.md') || lower.endsWith('.txt')){
        mod.html += `\n<!-- Imported from ${escapeHtml(file.name)} -->\n` + text;
      }else if(lower.endsWith('.css')){
        mod.css += `\n/* Imported from ${file.name} */\n` + text;
      }else if(lower.endsWith('.js')){
        mod.js += `\n// Imported from ${file.name}\n` + text;
      }else if(lower.endsWith('.json')){
        mod.json = text;
      }
    }
    els.codeFileInput.value = '';
    renderModules();
    selectModule(mod.id);
    setStatus('inspectorStatus', `Imported ${files.length} file(s) into selected module.`, 'good');
  }

  function startMove(e, id){
    e.preventDefault();
    const mod = state.modules.find(m=>m.id===id); if(!mod) return;
    selectModule(id);
    const start = {x:e.clientX, y:e.clientY, mx:mod.collapsed ? (mod.bubbleX ?? mod.x) : mod.x, my:mod.collapsed ? (mod.bubbleY ?? mod.y) : mod.y};
    const target = e.currentTarget.closest('.ap-module');
    target.setPointerCapture(e.pointerId);
    target.classList.add('dragging');
    function move(ev){
      const dx = (ev.clientX - start.x)/state.zoom;
      const dy = (ev.clientY - start.y)/state.zoom;
      const nextX = clamp(snap(start.mx + dx), 0, state.project.canvasWidth - 30);
      const nextY = clamp(snap(start.my + dy), 0, state.project.canvasHeight - 30);
      if(mod.collapsed){ mod.bubbleX = nextX; mod.bubbleY = nextY; } else { mod.x = nextX; mod.y = nextY; }
      target.style.left = `${nextX}px`; target.style.top = `${nextY}px`;
      els.propX.value = Math.round(mod.collapsed ? (mod.bubbleX ?? mod.x) : mod.x); els.propY.value = Math.round(mod.collapsed ? (mod.bubbleY ?? mod.y) : mod.y);
    }
    function up(ev){
      target.releasePointerCapture(ev.pointerId);
      target.classList.remove('dragging');
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    }
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }

  function startResize(e, id){
    e.preventDefault();
    const mod = state.modules.find(m=>m.id===id); if(!mod) return;
    if(mod.collapsed) return;
    selectModule(id);
    const start = {x:e.clientX, y:e.clientY, w:mod.w, h:mod.h};
    const target = e.currentTarget.closest('.ap-module');
    target.setPointerCapture(e.pointerId);
    function move(ev){
      const dx = (ev.clientX - start.x)/state.zoom;
      const dy = (ev.clientY - start.y)/state.zoom;
      mod.w = Math.max(70, snap(start.w + dx));
      mod.h = Math.max(60, snap(start.h + dy));
      target.style.width = `${mod.w}px`; target.style.height = `${mod.h}px`;
      els.propW.value = Math.round(mod.w); els.propH.value = Math.round(mod.h);
    }
    function up(ev){
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
    }
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }

  function duplicateSelected(){
    const mod = selectedModule(); if(!mod) return;
    const copy = JSON.parse(JSON.stringify(mod));
    copy.id = makeId(mod.type); copy.x += 28; copy.y += 28; copy.label += ' copy';
    state.modules.push(copy);
    renderModules(); selectModule(copy.id);
  }
  function deleteSelected(){
    if(!state.selectedId) return;
    state.modules = state.modules.filter(m => m.id !== state.selectedId);
    state.selectedId = null;
    renderModules(); selectModule(null);
  }

  function toggleGrid(){
    state.grid = !state.grid;
    els.canvas.classList.toggle('grid-on', state.grid);
    els.canvas.classList.toggle('grid-hidden', !state.grid);
    els.gridToggleBtn.textContent = `Grid: ${state.grid ? 'visible' : 'transparent'}`;
  }
  function toggleSnap(){
    state.snap = !state.snap;
    els.snapToggleBtn.textContent = `Snap: ${state.snap ? 'on' : 'off'}`;
  }
  function setZoom(value){
    state.zoom = clamp(Math.round(value*100)/100, .35, 2);
    els.canvas.style.transform = `scale(${state.zoom})`;
    els.zoomLabel.textContent = `${Math.round(state.zoom*100)}%`;
  }
  function centerWorkspace(){
    const maxX = Math.max(0, els.scroller.scrollWidth - els.scroller.clientWidth);
    const maxY = Math.max(0, els.scroller.scrollHeight - els.scroller.clientHeight);
    els.scroller.scrollTo({left:maxX/2, top:maxY/2, behavior:'smooth'});
  }


  function normalizePages(){
    if(!Array.isArray(state.project.pages) || !state.project.pages.length){
      state.project.pages = [{id:'home', title:'Home', slug:'index'}];
    }
    state.project.pages = state.project.pages.map((p, i) => ({
      id: p.id || (i === 0 ? 'home' : makeId('page')),
      title: p.title || (i === 0 ? 'Home' : `Page ${i+1}`),
      slug: i === 0 ? 'index' : slugify(p.slug || p.title || `page-${i+1}`)
    }));
    if(!state.project.pages.find(p => p.id === state.activePageId)) state.activePageId = state.project.pages[0].id;
  }

  function normalizePagesForExport(pages){
    const list = Array.isArray(pages) && pages.length ? pages : [{id:'home', title:'Home', slug:'index'}];
    return list.map((p,i)=>({id:p.id || (i===0?'home':`page-${i+1}`), title:p.title || (i===0?'Home':`Page ${i+1}`), slug:i===0?'index':slugify(p.slug || p.title || `page-${i+1}`)}));
  }

  function renderPageControls(){
    normalizePages();
    if(!els.pageSelect) return;
    els.pageSelect.innerHTML = state.project.pages.map(p => `<option value="${escapeAttr(p.id)}">${escapeHtml(p.title)} (${escapeHtml(p.slug)})</option>`).join('');
    els.pageSelect.value = state.activePageId;
    const page = activePage();
    if(els.pageTitleEdit) els.pageTitleEdit.value = page?.title || '';
    applyCanvasSize();
  }

  function activePage(){ return state.project.pages.find(p=>p.id===state.activePageId) || state.project.pages[0]; }

  function setActivePage(id){
    normalizePages();
    state.activePageId = id || state.project.pages[0].id;
    state.selectedId = null;
    renderPageControls();
    renderModules();
    selectModule(null);
    setStatus('pageStatus', `Editing ${activePage()?.title || 'page'}.`, 'good');
  }

  function addPageFromPrompt(){
    const title = prompt('New page name?', 'New Page');
    if(!title) return;
    normalizePages();
    const page = {id: makeId('page'), title: title.trim(), slug: slugify(title)};
    state.project.pages.push(page);
    state.activePageId = page.id;
    renderPageControls(); renderModules(); selectModule(null);
    setStatus('pageStatus', `Added ${page.title}.`, 'good');
  }

  function deleteActivePage(){
    normalizePages();
    if(state.project.pages.length <= 1){ setStatus('pageStatus','Keep at least one page.', 'warn'); return; }
    const page = activePage();
    if(!confirm(`Delete page ${page.title} and its modules?`)) return;
    state.modules = state.modules.filter(m => (m.pageId || 'home') !== page.id);
    state.project.pages = state.project.pages.filter(p => p.id !== page.id);
    state.activePageId = state.project.pages[0].id;
    renderPageControls(); renderModules(); selectModule(null);
    setStatus('pageStatus', 'Page deleted.', 'good');
  }

  function renameActivePage(){
    const page = activePage(); if(!page) return;
    const title = (els.pageTitleEdit?.value || '').trim();
    if(!title){ setStatus('pageStatus','Type a page name first.', 'warn'); return; }
    page.title = title;
    page.slug = page.id === 'home' ? 'index' : slugify(title);
    if(page.id === 'home') state.project.pageTitle = title;
    hydrateProjectForm(); renderPageControls();
    setStatus('pageStatus', `Renamed page to ${title}.`, 'good');
  }

  function toggleModuleCollapse(id){
    const mod = state.modules.find(m=>m.id===id); if(!mod) return;
    if(!mod.collapsed){
      mod.savedW = mod.w; mod.savedH = mod.h; mod.bubbleX = mod.bubbleX ?? mod.x; mod.bubbleY = mod.bubbleY ?? mod.y;
      mod.collapsed = true;
    }else{
      mod.collapsed = false;
      mod.w = mod.savedW || mod.w || 360; mod.h = mod.savedH || mod.h || 240;
    }
    renderModules(); selectModule(id);
  }

  async function importGameFilesToModule(mod, files){
    if(!mod || !files.length) return;
    mod.assets = Array.isArray(mod.assets) ? mod.assets : [];
    const root = `games/${cssIdent(mod.id)}/`;
    for(const file of files){
      const dataUrl = await readFileAsDataURL(file);
      const safeName = file.name.replace(/[^a-z0-9._-]+/gi,'_');
      mod.assets.push({name:file.name, path:root + safeName, mime:file.type || 'application/octet-stream', dataUrl});
    }
    const indexAsset = mod.assets.find(a => /index\.html?$/i.test(a.name)) || mod.assets.find(a => /\.html?$/i.test(a.name));
    const buttons = mod.assets.map(a=>`<button type="button" data-game-src="${escapeAttr(a.path)}">${escapeHtml(a.name)}</button>`).join(' ');
    mod.html = `<section class="ap-game-upload" data-ap-game-module><h3 contenteditable="true">HTML Mobile Games</h3><p contenteditable="true">Imported games export into ${root}</p><input data-ap-game-upload type="file" webkitdirectory multiple><div data-ap-game-list>${buttons}</div><iframe class="ap-game-frame" src="${escapeAttr(indexAsset?.path || '')}" title="Game player"></iframe></section>`;
    mod.json = JSON.stringify({assets: mod.assets.map(({dataUrl, ...rest}) => rest), exportFolder: root}, null, 2);
    renderModules(); selectModule(mod.id);
    setStatus('inspectorStatus', `Added ${files.length} game file(s) to ${mod.label}.`, 'good');
  }

  function readFileAsDataURL(file){
    return new Promise((resolve, reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(reader.error); reader.readAsDataURL(file); });
  }

  function addModuleAssetsToExport(files, data){
    for(const mod of data.modules){
      for(const asset of (mod.assets || [])){
        if(!asset.path || !asset.dataUrl) continue;
        files[asset.path] = dataUrlToBytes(asset.dataUrl);
      }
    }
  }

  function dataUrlToBytes(dataUrl){
    const b64 = String(dataUrl).split(',')[1] || '';
    const raw = atob(b64);
    const bytes = new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function activateTab(name){
    $$('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab === name));
    $$('.tab-panel').forEach(p=>p.classList.toggle('active', p.id === `tab-${name}`));
  }

  function hydrateProjectForm(){
    els.projectName.value = state.project.name;
    els.projectSlug.value = state.project.slug;
    els.pageTitle.value = state.project.pageTitle;
    els.canvasWidth.value = state.project.canvasWidth;
    els.canvasHeight.value = state.project.canvasHeight;
    els.projectDescription.value = state.project.description;
    els.backendUrl.value = state.project.backendUrl;
    els.themeColor.value = state.project.themeColor;
    els.accentColor.value = state.project.accentColor;
    els.globalCss.value = state.project.globalCss;
  }
  function updateProjectFromForm(){
    state.project.name = els.projectName.value || 'Untitled Project';
    state.project.slug = slugify(els.projectSlug.value || els.projectName.value || 'untitled-project');
    els.projectSlug.value = state.project.slug;
    state.project.pageTitle = els.pageTitle.value || state.project.name;
    state.project.canvasWidth = Math.max(320, Number(els.canvasWidth.value || 1200));
    state.project.canvasHeight = Math.max(320, Number(els.canvasHeight.value || 820));
    state.project.description = els.projectDescription.value || '';
    state.project.backendUrl = els.backendUrl.value.trim();
    state.project.themeColor = els.themeColor.value || '#6ff7ff';
    state.project.accentColor = els.accentColor.value || '#ff8fe7';
    state.project.globalCss = els.globalCss.value || '';
    normalizePages();
    applyCanvasSize();
  }
  function applyCanvasSize(){
    els.canvas.style.width = `${state.project.canvasWidth}px`;
    els.canvas.style.height = `${state.project.canvasHeight}px`;
    els.pageLabel.textContent = `${activePage()?.title || state.project.pageTitle || 'Home'} • ${state.project.canvasWidth} × ${state.project.canvasHeight}`;
  }

  function saveLocal(){
    updateProjectFromForm();
    localStorage.setItem(STORE_KEY, JSON.stringify(exportableProjectData(), null, 2));
    setStatus('projectStatus','Saved in this browser.', 'good');
  }
  function loadLocal(show=true){
    const raw = localStorage.getItem(STORE_KEY);
    if(!raw){ if(show) alert('No local project has been saved in this browser yet.'); return; }
    try{
      importProjectData(JSON.parse(raw));
      if(show) setStatus('projectStatus','Loaded local project.', 'good');
    }catch(err){ alert('Local project could not be loaded: '+err.message); }
  }
  function importProjectJson(){
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.addEventListener('change', async ()=>{
      const file = input.files[0]; if(!file) return;
      try{ importProjectData(JSON.parse(await file.text())); setStatus('projectStatus', `Imported ${file.name}.`, 'good'); }
      catch(err){ alert('Import failed: '+err.message); }
    });
    input.click();
  }
  function importProjectData(data){
    state.project = {...state.project, ...(data.project || data.settings || {})};
    state.modules = Array.isArray(data.modules) ? data.modules.map(m => ({pageId:'home', assets:[], ...m})) : [];
    normalizePages();
    state.activePageId = state.project.pages[0]?.id || 'home';
    state.selectedId = null;
    hydrateProjectForm(); renderPageControls(); applyCanvasSize(); renderModules(); selectModule(null);
  }

  function openPreview(){
    updateProjectFromForm();
    const files = generateExportFiles();
    const html = files['index.html'];
    showModal('Preview exported site', `<iframe class="preview-frame" title="Preview"></iframe>`, [
      {label:'Close', cls:'btn', action:'close'},
      {label:'Export ZIP', cls:'btn primary', action:()=>{ closeModal(); exportProjectZip(); }}
    ], (modal)=>{
      const frame = modal.querySelector('iframe');
      frame.srcdoc = html.replace('</body>', `<script>${files['js/app.js'].replace(/<\/script/gi,'<\\/script')}<\/script></body>`);
    });
  }

  function exportableProjectData(){
    return {
      createdWith: "An Admin's Place",
      exportedAt: new Date().toISOString(),
      project: {...state.project, pages: normalizePagesForExport(state.project.pages)},
      modules: state.modules.map(m=>({...m}))
    };
  }

  async function exportProjectZip(){
    updateProjectFromForm();
    try{
      const files = generateExportFiles();
      const zip = new ZipStore();
      const root = state.project.slug || 'admin-place-project';
      for(const [path, content] of Object.entries(files)) zip.addFile(`${root}/${path}`, content);
      await zip.download(`${root}.zip`);
      setStatus('exportStatus', `Exported ${Object.keys(files).length} files as ${root}.zip.`, 'good');
    }catch(err){
      console.error(err);
      setStatus('exportStatus', 'Export failed: '+err.message, 'warn');
    }
  }

  async function exportEditorBackup(){
    const zip = new ZipStore();
    const files = generateEditorBackupFiles();
    for(const [path, content] of Object.entries(files)) zip.addFile(`An_Admins_Place/${path}`, content);
    await zip.download('An_Admins_Place_editor_backup.zip');
    setStatus('exportStatus', 'Editor backup ZIP generated from the loaded app files.', 'good');
  }

  function generateExportFiles(){
    const data = exportableProjectData();
    const css = generateProjectCss(data);
    const js = generateProjectJs(data);
    const pages = normalizePagesForExport(data.project.pages);
    const readme = generateReadme(data);
    const files = {
      'css/styles.css': css,
      'js/app.js': js,
      'data/project.json': JSON.stringify(data, null, 2),
      'README_DEPLOY.md': readme
    };
    pages.forEach((page, index) => {
      const path = index === 0 || page.slug === 'index' ? 'index.html' : `pages/${slugify(page.slug || page.title)}.html`;
      files[path] = generateProjectHtml(data, page, path);
    });
    addModuleAssetsToExport(files, data);
    if(els.includeBackend?.checked){
      files['backend/Code.gs'] = generateCodeGs(data);
    }
    if(els.includeEditorData?.checked){
      files['data/module-catalog.json'] = JSON.stringify(state.catalog, null, 2);
      files['data/source-repository-adapters.json'] = JSON.stringify(state.adapters || {}, null, 2);
      files['data/wix-module-adapters.json'] = JSON.stringify(state.wixAdapters || {}, null, 2);
      files['data/rpg-tool-module-adapters.json'] = JSON.stringify(state.rpgAdapters || {}, null, 2);
      files['data/scanner-generator-module-adapters.json'] = JSON.stringify(state.scannerAdapters || {}, null, 2);
      files['data/settlement-location-module-adapters.json'] = JSON.stringify(state.settlementAdapters || {}, null, 2);
      files['data/expanded-site-builder-module-adapters.json'] = JSON.stringify(state.expandedAdapters || {}, null, 2);
      // Full immersive settlement records live in the editor package; exported project modules also carry their own selected JSON.
      files['data/immersive-settlement-records.README.txt'] = 'Full settlement source records are included in the An Admins Place editor package under data/immersive-settlement-records.json. Individual dragged settlement modules export their own module JSON inside data/project.json.';
    }
    if(els.includeAdminNotes?.checked){
      files['docs/admin-notes.md'] = generateAdminNotes(data);
    }
    return files;
  }

  function generateProjectHtml(data, page=null, currentPath='index.html'){
    const p = data.project;
    const activePage = page || normalizePagesForExport(p.pages)[0];
    const assetPrefix = currentPath.startsWith('pages/') ? '../' : '';
    const moduleHtml = data.modules.filter(m => (m.pageId || 'home') === (activePage.id || 'home')).map(m => {
      const inner = m.collapsed ? `<button class="ap-export-bubble" type="button" aria-label="Open ${escapeAttr(m.label)}">☰</button><div class="ap-export-collapsed-content">${m.href ? `<a class=\"module-link-shell\" href=\"${escapeAttr(m.href)}\">${m.html}</a>` : m.html}</div>` : (m.href ? `<a class="module-link-shell" href="${escapeAttr(m.href)}">${m.html}</a>` : m.html);
      return `<div class="ap-export-module module-${escapeAttr(m.id)} ${m.collapsed ? 'is-collapsed' : ''}" data-module-id="${escapeAttr(m.id)}" data-module-type="${escapeAttr(m.type)}" data-page-id="${escapeAttr(m.pageId || 'home')}">${inner}</div>`;
    }).join('\n      ');
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${escapeAttr(p.themeColor)}">
  <meta name="description" content="${escapeAttr(p.description)}">
  <title>${escapeHtml(activePage.title || p.pageTitle)} — ${escapeHtml(p.name || '')}</title>
  <link rel="stylesheet" href="${assetPrefix}css/styles.css">
</head>
<body>
  <main class="ap-export-page" id="app" data-page-id="${escapeAttr(activePage.id)}" data-current-path="${escapeAttr(currentPath)}">
      ${moduleHtml}
  </main>
  <script>window.ADMIN_PLACE_BACKEND_URL=${JSON.stringify(p.backendUrl || '')};</script>
  <script src="${assetPrefix}js/app.js"></script>
</body>
</html>
`;
  }

  function generateProjectCss(data){
    const p = data.project;
    const base = `:root{--theme:${p.themeColor};--accent:${p.accentColor};--ink:#f7fbff;--bg:#070912}*{box-sizing:border-box}html,body{margin:0;min-height:100%;}body{background:radial-gradient(circle at top left, color-mix(in srgb, var(--theme) 20%, transparent), transparent 34%),linear-gradient(135deg,#070912,#111827);color:var(--ink);font-family:Inter,system-ui,sans-serif}.ap-export-page{position:relative;width:min(100%, ${p.canvasWidth}px);min-height:${p.canvasHeight}px;margin:0 auto;overflow:hidden;background:linear-gradient(135deg,rgba(14,25,42,.92),rgba(14,12,28,.92));box-shadow:0 20px 80px rgba(0,0,0,.35)}.ap-export-module{position:absolute;overflow:hidden;touch-action:none}.ap-export-module.is-collapsed{width:75px!important;height:75px!important;border-radius:24px!important}.ap-export-bubble{width:100%;height:100%;border:1px solid rgba(255,255,255,.22);border-radius:24px;background:rgba(0,0,0,.58);color:#fff;font-size:2rem}.ap-export-module.is-collapsed .ap-export-collapsed-content{display:none}.ap-export-module:not(.is-collapsed) .ap-export-bubble{display:none}.module-link-shell{display:block;height:100%;color:inherit;text-decoration:none}.module-link-shell:focus{outline:3px solid var(--theme);outline-offset:3px}.ap-page-nav a{color:inherit}.ap-social-frame,.ap-game-frame{width:100%;height:70%;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:#fff}@media(max-width:760px){.ap-export-page{width:100%;height:auto;min-height:100vh;padding:.75rem;display:flex;flex-direction:column;gap:.75rem;overflow:visible}.ap-export-module{position:relative!important;left:auto!important;top:auto!important;width:100%!important;max-width:100%!important;min-height:min(65vh,420px);height:auto!important}.ap-export-module.is-collapsed{width:75px!important;min-height:75px!important;height:75px!important;align-self:flex-start}}@media print{body{background:#fff;color:#000}.ap-export-page{box-shadow:none}.ap-export-bubble{display:none}}
${p.globalCss || ''}
`;
    const moduleCss = data.modules.map(m => {
      const bgImage = m.bgImage ? `background-image:linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),url("${cssUrl(m.bgImage)}");background-size:cover;background-position:center;` : '';
      const cssX = m.collapsed ? (m.bubbleX ?? m.x) : m.x;
      const cssY = m.collapsed ? (m.bubbleY ?? m.y) : m.y;
      const cssW = m.collapsed ? 75 : m.w;
      const cssH = m.collapsed ? 75 : m.h;
      return `.module-${cssIdent(m.id)}{left:${cssX}px;top:${cssY}px;width:${cssW}px;height:${cssH}px;color:${m.color || '#f7fbff'};background-color:${m.bg || 'transparent'};border-radius:${m.radius || 0}px;font-size:${m.fontSize || 16}px;${bgImage}}
${m.css || ''}`;
    }).join('\n\n');
    return base + '\n' + moduleCss;
  }

  function generateProjectJs(data){
    const safeData = JSON.stringify(data, null, 2).replace(/<\/script/gi, '<\\/script');
    const templateScripts = [];
    for(const m of data.modules){
      if(m.runJs && m.js) templateScripts.push(`// Module: ${m.label} (${m.id})\ntry{\n${m.js}\n}catch(err){console.error('Module script failed: ${m.id}', err);}`);
    }
    return `// Generated by An Admin's Place
window.ADMIN_PLACE_PROJECT = ${safeData};
(function(){
  'use strict';
  function postToBackend(payload){
    const endpoint = window.ADMIN_PLACE_BACKEND_URL || '';
    if(!endpoint) return Promise.reject(new Error('No backend URL configured.'));
    return fetch(endpoint,{method:'POST',mode:'no-cors',body:JSON.stringify(payload)});
  }
  window.AdminPlace = { project: window.ADMIN_PLACE_PROJECT, postToBackend };
  function pageHref(page){ const inPages=(document.getElementById('app')?.dataset.currentPath||'').startsWith('pages/'); if(page.slug === 'index' || page.id === 'home') return inPages ? '../index.html' : 'index.html'; return inPages ? (page.slug || page.id) + '.html' : 'pages/' + (page.slug || page.id) + '.html'; }
  document.querySelectorAll('[data-ap-page-nav]').forEach(nav=>{
    const pages=(window.ADMIN_PLACE_PROJECT.project.pages||[]);
    nav.innerHTML = pages.map(p=>'<a href="'+pageHref(p)+'">'+(p.title||p.slug||p.id)+'</a>').join(' ');
  });
  document.querySelectorAll('.ap-export-module').forEach(module=>{
    let drag=null;
    const bubble=module.querySelector('.ap-export-bubble');
    if(bubble) bubble.addEventListener('click', ()=>{ module.classList.toggle('is-collapsed'); });
    module.addEventListener('pointerdown', e=>{ if(!e.target.closest('.ap-export-bubble')) return; drag={x:e.clientX,y:e.clientY,left:module.offsetLeft,top:module.offsetTop}; module.setPointerCapture(e.pointerId); });
    module.addEventListener('pointermove', e=>{ if(!drag) return; module.style.left=(drag.left+e.clientX-drag.x)+'px'; module.style.top=(drag.top+e.clientY-drag.y)+'px'; });
    module.addEventListener('pointerup', ()=>{ drag=null; });
  });
  document.querySelectorAll('[data-ap-social-link]').forEach(link=>{
    link.addEventListener('click', e=>{
      const frame=document.querySelector(link.getAttribute('data-ap-social-target') || '.ap-social-frame');
      if(frame){ e.preventDefault(); frame.src=link.href; }
    });
  });
  document.querySelectorAll('[data-ap-game-list]').forEach(list=>{
    list.addEventListener('click', e=>{ const btn=e.target.closest('[data-game-src]'); if(!btn) return; const frame=list.closest('[data-ap-game-module]')?.querySelector('.ap-game-frame'); if(frame){ const inPages=(document.getElementById('app')?.dataset.currentPath||'').startsWith('pages/'); frame.src=(inPages && !/^https?:|^\.\.|^\//.test(btn.dataset.gameSrc) ? '../' : '') + btn.dataset.gameSrc; } });
  });
  document.querySelectorAll('[data-ap-messenger]').forEach(root=>{
    const log=root.querySelector('[data-msg-log]'); const form=root.querySelector('form');
    const key='ap-messenger-'+(root.dataset.room||'main');
    const draw=()=>{ const msgs=JSON.parse(localStorage.getItem(key)||'[]'); if(log) log.innerHTML=msgs.slice(-50).map(m=>'<p><b>'+m.name+'</b>: '+m.text+'</p>').join(''); };
    draw();
    form?.addEventListener('submit', async e=>{ e.preventDefault(); const fd=Object.fromEntries(new FormData(form).entries()); if(!fd.text) return; const msgs=JSON.parse(localStorage.getItem(key)||'[]'); msgs.push({name:fd.name||'Member', text:fd.text, at:new Date().toISOString()}); localStorage.setItem(key,JSON.stringify(msgs)); form.reset(); draw(); try{ await postToBackend({action:'saveSiteMessage', data:{room:root.dataset.room||'main', ...fd}}); }catch(err){} });
  });
  document.querySelectorAll('[data-gas-form]').forEach(form=>{
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const status=form.querySelector('[data-status]');
      const data=Object.fromEntries(new FormData(form).entries());
      try{ await postToBackend({action:'formSubmission', data}); if(status) status.textContent='Sent.'; }
      catch(err){ if(status) status.textContent=err.message; }
    });
  });
  ${templateScripts.join('\n\n')}
})();
`;
  }

  function generateReadme(data){
    const p = data.project;
    return `# ${p.name}

Generated with **An Admin's Place**.

## GitHub Pages deployment

1. Unzip this folder.
2. Upload the folder contents to a GitHub repository.
3. In GitHub, open **Settings → Pages**.
4. Choose your branch and root folder, then save.
5. Open the Pages URL once GitHub finishes building.

## Optional Google Apps Script backend

1. Open Google Apps Script.
2. Create a new project.
3. Replace the default code with \`backend/Code.gs\`.
4. Click **Deploy → New deployment → Web app**.
5. Set access to the intended users.
6. Copy the Web App URL into this project where \`window.ADMIN_PLACE_BACKEND_URL\` is configured.

## Files

- \`index.html\` — static page
- \`css/styles.css\` — generated styling
- \`js/app.js\` — generated runtime behavior
- \`data/project.json\` — complete project data
- \`backend/Code.gs\` — optional Apps Script backend template

## Source adapters included

${[...(state.adapters?.repositories || []), ...(state.wixAdapters?.repositories || []), ...(state.rpgAdapters?.repositories || []), ...(state.scannerAdapters?.repositories || []), ...(state.settlementAdapters?.repositories || []), ...(state.expandedAdapters?.repositories || [])].map(r=>`- ${r.archive || r.repoSource || 'source'}: ${r.adapter || r.label || r.runtime || ''}`).join('\n')}
`;
  }

  function generateAdminNotes(data){
    return `# Admin Notes

Project: ${data.project.name}
Exported: ${data.exportedAt}

## Modules

${data.modules.map(m=>`- ${m.label} (${m.type}) from ${m.repoSource}; position ${m.x},${m.y}; size ${m.w}x${m.h}`).join('\n')}

## Editing reminder

To keep a project editable, save data/project.json and re-import it into An Admin's Place later.
`;
  }

  function generateCodeGs(data){
    const slug = data.project.slug || 'admin-place-project';
    return `/**
 * Google Apps Script backend template for ${data.project.name}
 * Generated by An Admin's Place.
 * Deploy as Web App. Execute as: Me. Access: choose what your project needs.
 */
const ADMIN_PLACE_PROJECT = ${JSON.stringify(slug)};

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  if (action === 'ping') {
    return json_({ ok: true, project: ADMIN_PLACE_PROJECT, time: new Date().toISOString() });
  }
  if (action === 'loadProject') {
    return json_({ ok: true, project: loadProject_() });
  }
  return json_({ ok: true, message: 'An Admin\\'s Place backend is running.', action: action });
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Invalid JSON: ' + err.message });
  }
  const action = payload.action || 'saveProject';
  if (action === 'saveProject') {
    saveProject_(payload.data || payload.project || payload);
    return json_({ ok: true, action: action, savedAt: new Date().toISOString() });
  }
  if (action === 'formSubmission') {
    appendRecord_('formSubmissions', payload.data || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'appendMessage') {
    appendRecord_('messages', payload.data || payload.message || {});
    return json_({ ok: true, action: action });
  }
  if (action === 'saveCampaignRecord') {
    appendRecord_('campaignRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveVttScene') {
    appendRecord_('vttScenes', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveWorldbuildingArticle') {
    appendRecord_('worldbuildingArticles', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveCharacter') {
    appendRecord_('characters', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveAudioMetadata') {
    appendRecord_('audioMetadata', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveMapScannerData') {
    appendRecord_('mapScannerData', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveSettlementGeneratorData') {
    appendRecord_('settlementGeneratorData', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveGeoJsonOverlay') {
    appendRecord_('geoJsonOverlays', payload.data || payload.geojson || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveConversationScanPacket') {
    appendRecord_('conversationScanPackets', payload.data || payload.packet || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveResponseCatalog') {
    appendRecord_('responseCatalogs', payload.data || payload.catalog || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveLoreGeneratorRecord') {
    appendRecord_('loreGeneratorRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveSettlementModule') {
    appendRecord_('settlementModules', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveImmersiveLocationSet') {
    appendRecord_('immersiveLocationSets', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveUniversalVttConversion') {
    appendRecord_('universalVttConversions', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveDungeonFogTimerLog') {
    appendRecord_('dungeonFogTimerLogs', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveDungeonFogSvgRecord') {
    appendRecord_('dungeonFogSvgRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveTileAssemblyManifest') {
    appendRecord_('tileAssemblyManifests', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveLoginEvent') {
    appendRecord_('loginEvents', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveSiteMessage') {
    appendRecord_('siteMessages', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveLifeSimulatorState') {
    appendRecord_('lifeSimulatorStates', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveCalendarEvent') {
    appendRecord_('calendarEvents', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveGameUploadManifest') {
    appendRecord_('gameUploadManifests', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveVideoMeetingRoom') {
    appendRecord_('videoMeetingRooms', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveArkenforgeMapRecord') {
    appendRecord_('arkenforgeMapRecords', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  if (action === 'saveRustforgedPackage') {
    appendRecord_('rustforgedPackages', payload.data || payload);
    return json_({ ok: true, action: action });
  }
  appendRecord_('events', payload);
  return json_({ ok: true, action: action });
}

function saveProject_(projectData) {
  PropertiesService.getScriptProperties().setProperty('projectData', JSON.stringify(projectData || {}));
}

function loadProject_() {
  const raw = PropertiesService.getScriptProperties().getProperty('projectData');
  return raw ? JSON.parse(raw) : null;
}

function appendRecord_(bucket, record) {
  const props = PropertiesService.getScriptProperties();
  const key = 'bucket_' + bucket;
  const existing = JSON.parse(props.getProperty(key) || '[]');
  existing.push({ at: new Date().toISOString(), record: record });
  props.setProperty(key, JSON.stringify(existing.slice(-500)));
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  }

  function generateEditorBackupFiles(){
    return {
      'index.html': document.documentElement.outerHTML,
      'css/editor.css': '/* Use the downloaded app ZIP from ChatGPT for the complete editor CSS. This in-browser backup captures current HTML and project data. */\n',
      'data/current-project.json': JSON.stringify(exportableProjectData(), null, 2),
      'data/module-catalog.json': JSON.stringify(state.catalog, null, 2),
      'data/source-repository-adapters.json': JSON.stringify(state.adapters || {}, null, 2),
      'data/wix-module-adapters.json': JSON.stringify(state.wixAdapters || {}, null, 2),
      'data/rpg-tool-module-adapters.json': JSON.stringify(state.rpgAdapters || {}, null, 2),
      'data/scanner-generator-module-adapters.json': JSON.stringify(state.scannerAdapters || {}, null, 2),
      'data/settlement-location-module-adapters.json': JSON.stringify(state.settlementAdapters || {}, null, 2),
      'data/expanded-site-builder-module-adapters.json': JSON.stringify(state.expandedAdapters || {}, null, 2),
      'README.md': '# An Admin\'s Place editor backup\n\nThis backup includes the current project data. Use the full editor ZIP for source files.\n'
    };
  }

  function showModal(title, bodyHtml, actions=[], afterOpen){
    els.modalRoot.className = 'modal-backdrop';
    els.modalRoot.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><header><h2>${escapeHtml(title)}</h2><button class="btn" data-close type="button">Close</button></header><main>${bodyHtml}</main><footer></footer></section>`;
    const modal = els.modalRoot.querySelector('.modal');
    const footer = modal.querySelector('footer');
    els.modalRoot.querySelector('[data-close]').addEventListener('click', closeModal);
    actions.forEach(a=>{
      const btn = document.createElement('button'); btn.type='button'; btn.className=a.cls || 'btn'; btn.textContent=a.label;
      btn.addEventListener('click', () => a.action === 'close' ? closeModal() : a.action?.());
      footer.appendChild(btn);
    });
    if(afterOpen) afterOpen(modal);
  }
  function closeModal(){ els.modalRoot.className = 'hidden'; els.modalRoot.innerHTML = ''; }

  function onKeydown(e){
    const active = document.activeElement;
    const typing = active && ['INPUT','TEXTAREA','SELECT'].includes(active.tagName) || active?.isContentEditable;
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'){
      e.preventDefault(); saveLocal(); return;
    }
    if(!typing && (e.key === 'Delete' || e.key === 'Backspace')) deleteSelected();
  }

  function setStatus(id, text, kind=''){
    const el = els[id] || document.getElementById(id);
    if(!el) return;
    el.textContent = text;
    el.className = 'status-line ' + kind;
  }
  function snap(v){ return state.snap ? Math.round(Number(v || 0)/12)*12 : Number(v || 0); }
  function clamp(v,min,max){ return Math.min(max, Math.max(min, v)); }
  function makeId(prefix='module'){ return `${prefix.replace(/[^a-z0-9]+/gi,'-')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`; }
  function slugify(s){ return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'admin-place-project'; }
  function escapeHtml(s){ return String(s ?? '').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
  function escapeAttr(s){ return String(s ?? '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function cssUrl(s){ return String(s ?? '').replace(/["\\\n\r]/g,''); }
  function cssIdent(s){ return String(s).replace(/[^a-zA-Z0-9_-]/g,'-'); }
  function toHex(color){
    if(/^#[0-9a-f]{6}$/i.test(color)) return color;
    if(/^#[0-9a-f]{3}$/i.test(color)) return '#'+color.slice(1).split('').map(x=>x+x).join('');
    return '#101522';
  }
})();
