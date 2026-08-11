/* Shared retro character-sheet expandable module behavior. */
(function(){
  'use strict';

  const pageName=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const configurations={
    'creator.html':[
      '.creator-grid > .panel',
      '.build-panel > .panel-section',
      '.inspector-panel > .panel-section'
    ],
    'index.html':[
      '.sidebar > .sidebar-card',
      '.view > .panel',
      '.view > section.panel',
      '.assistant-workbench > .panel',
      '.assistant-workbench > section',
      '.assistant-workbench > aside',
      '.directory-layout > .panel',
      '.directory-layout > section',
      '.directory-layout > aside',
      '.context-card',
      '.active-project-panel',
      '.tool-dock',
      '.task-board',
      '.template-strip'
    ],
    'studio.html':[
      '.welcome-main > .start-card',
      '.welcome-main > .import-card',
      '.welcome-main > .map-start-card',
      '.welcome-side > .notice-card',
      '.studio-screen > .side-panel',
      '.studio-screen > .stage-panel',
      '.studio-screen > .properties-panel',
      '.side-panel > .panel-section',
      '.properties-panel > .panel-section'
    ],
    'map-studio.html':[
      '.welcome-main > .start-card',
      '.welcome-main > .import-card',
      '.welcome-main > .map-start-card',
      '.welcome-side > .notice-card',
      '.studio-screen > .side-panel',
      '.studio-screen > .stage-panel',
      '.studio-screen > .properties-panel',
      '.side-panel > .panel-section',
      '.properties-panel > .panel-section'
    ]
  };
  const storageKey=`retroCharacterModules:${pageName}`;
  let remembered={};
  try{remembered=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}}catch(error){remembered={}}

  const clean=(value)=>String(value||'').replace(/\s+/g,' ').trim();
  const humanize=(value)=>clean(value).replace(/[-_]+/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase());

  function getTitle(element,index){
    const explicit=clean(element.dataset.retroTitle||element.getAttribute('aria-label'));
    if(explicit)return explicit;
    const titleNode=element.querySelector(':scope > h1,:scope > h2,:scope > h3,:scope > header h1,:scope > header h2,:scope > header h3,:scope > .section-title h1,:scope > .section-title h2,:scope > .section-title h3,:scope > .panel-heading h1,:scope > .panel-heading h2,:scope > .panel-heading h3');
    const nodeTitle=clean(titleNode?.textContent);
    if(nodeTitle)return nodeTitle;
    if(element.id)return humanize(element.id);
    const useful=Array.from(element.classList).find(name=>!['panel','panel-section','compact','wide','is-active'].includes(name));
    return useful?humanize(useful):`Module ${index+1}`;
  }

  function moduleKey(element,index){
    return element.id||element.dataset.retroKey||`${pageName.replace(/\W+/g,'-')}-${index+1}`;
  }

  function setCollapsed(element,collapsed,persist=true){
    element.classList.toggle('is-retro-collapsed',collapsed);
    const button=element.querySelector(':scope > .retro-character-module-hd .retro-character-module-toggle');
    if(button){
      button.textContent=collapsed?'+':'−';
      button.setAttribute('aria-expanded',String(!collapsed));
      button.title=collapsed?'Expand module':'Collapse module';
    }
    if(persist){
      remembered[element.dataset.retroModuleKey]=collapsed;
      try{localStorage.setItem(storageKey,JSON.stringify(remembered))}catch(error){}
    }
  }

  function decorate(element,index){
    if(!element||element.dataset.retroDecorated==='true')return element;
    element.dataset.retroDecorated='true';
    element.dataset.retroModuleKey=moduleKey(element,index);
    element.classList.add('retro-character-module');

    const header=document.createElement('div');
    header.className='retro-character-module-hd';
    const title=document.createElement('h2');
    title.className='retro-character-module-title';
    title.textContent=getTitle(element,index);
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='retro-character-module-toggle';
    toggle.setAttribute('aria-label',`Collapse or expand ${title.textContent}`);
    header.append(title,toggle);
    element.prepend(header);

    toggle.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      setCollapsed(element,!element.classList.contains('is-retro-collapsed'));
    });
    header.addEventListener('dblclick',event=>{
      if(event.target.closest('button,input,select,textarea,a,label'))return;
      setCollapsed(element,!element.classList.contains('is-retro-collapsed'));
    });
    setCollapsed(element,Boolean(remembered[element.dataset.retroModuleKey]),false);
    return element;
  }

  function enhanceExistingDirectoryModules(){
    const existing=Array.from(document.querySelectorAll('[data-module].module'));
    existing.forEach((element,index)=>{
      element.classList.add('retro-character-module');
      element.dataset.retroModuleKey=element.id||`directory-module-${index+1}`;
    });
    return existing;
  }

  function buildNavigator(modules){
    if(!modules.length||document.querySelector('.quick-nav,.retro-module-nav'))return;
    const nav=document.createElement('div');
    nav.className='retro-module-nav';
    nav.innerHTML=`<button class="retro-module-nav-toggle" type="button" aria-expanded="false" title="Click to open. Drag to move."><b>☰</b><span>Modules</span></button><div class="retro-module-nav-panel"><label>Jump to expandable module</label><select></select><div class="retro-module-nav-actions"><button type="button" class="retro-module-nav-go">Go</button><button type="button" class="retro-module-expand-all">Expand All</button><button type="button" class="retro-module-collapse-all">Collapse All</button></div><small class="retro-module-nav-hint">Every module uses the same retro character-sheet expansion system. Expanded modules reflow the page instead of overlapping it.</small></div>`;
    document.body.append(nav);
    const select=nav.querySelector('select');
    modules.forEach((module,index)=>{
      const option=document.createElement('option');
      option.value=String(index);
      option.textContent=clean(module.querySelector(':scope > .retro-character-module-hd .retro-character-module-title')?.textContent)||`Module ${index+1}`;
      select.append(option);
    });
    nav.querySelector('.retro-module-nav-go').addEventListener('click',()=>{
      const module=modules[Number(select.value)||0];
      if(!module)return;
      let parent=module.parentElement;
      while(parent){
        if(parent.classList?.contains('retro-character-module'))setCollapsed(parent,false);
        parent=parent.parentElement;
      }
      setCollapsed(module,false);
      module.scrollIntoView({behavior:'smooth',block:'start'});
    });
    nav.querySelector('.retro-module-expand-all').addEventListener('click',()=>modules.forEach(module=>setCollapsed(module,false)));
    nav.querySelector('.retro-module-collapse-all').addEventListener('click',()=>modules.forEach(module=>setCollapsed(module,true)));

    const navToggle=nav.querySelector('.retro-module-nav-toggle');
    let dragging=false,moved=false,offsetX=0,offsetY=0;
    navToggle.addEventListener('click',()=>{
      if(moved){moved=false;return}
      nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded',String(nav.classList.contains('is-open')));
    });
    navToggle.addEventListener('pointerdown',event=>{
      dragging=true;moved=false;
      const rect=nav.getBoundingClientRect();
      offsetX=event.clientX-rect.left;offsetY=event.clientY-rect.top;
      try{navToggle.setPointerCapture(event.pointerId)}catch(error){}
    });
    navToggle.addEventListener('pointermove',event=>{
      if(!dragging)return;
      moved=true;
      nav.style.left=`${Math.max(0,Math.min(innerWidth-72,event.clientX-offsetX))}px`;
      nav.style.top=`${Math.max(0,Math.min(innerHeight-72,event.clientY-offsetY))}px`;
    });
    navToggle.addEventListener('pointerup',event=>{
      dragging=false;
      try{navToggle.releasePointerCapture(event.pointerId)}catch(error){}
    });
  }

  function init(){
    if(pageName==='universal_project_ai_directory.html'){
      enhanceExistingDirectoryModules();
      return;
    }
    const selectors=configurations[pageName]||['main > section','main > article','main > aside'];
    const found=[];
    selectors.forEach(selector=>{
      document.querySelectorAll(selector).forEach(element=>{
        if(!found.includes(element)&&clean(element.textContent).length>0)found.push(element);
      });
    });
    const modules=found.map(decorate).filter(Boolean);
    buildNavigator(modules);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
