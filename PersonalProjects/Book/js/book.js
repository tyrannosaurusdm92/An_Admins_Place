(() => {
"use strict";
const library = window.WRITING_LIBRARY || {works:[], counts:{poems:0,short_stories:0,works:0,characters:0}};
const $ = id => document.getElementById(id);
const els = {
  shell:$('appShell'), book:$('book'), cover:$('closedCover'), open:$('openBookBtn'), left:$('leftPage'), right:$('rightPage'), sheet:$('turnSheet'), status:$('pageStatus'),
  mini:$('miniIndex'), count:$('indexCount'), search:$('searchInput'), audio:$('pageFlipAudio'), sound:$('soundBtn'), zoomLabel:$('zoomLabel'),
  coverBtn:$('coverBtn'), contentsBtn:$('contentsBtn'), prev:$('prevBtn'), next:$('nextBtn'), prevB:$('prevBottomBtn'), nextB:$('nextBottomBtn'), zoomOut:$('zoomOutBtn'), zoomIn:$('zoomInBtn'), zoomFit:$('zoomFitBtn')
};
const mqSingle = window.matchMedia('(max-width: 700px)');
const state = {
  pages:[], cursor:0, open:false, turning:false, drag:null, search:'',
  zoom:clamp(Number(readSetting('writing-book-zoom','1')) || 1,.72,1.55),
  sound:readSetting('writing-book-sound','on') !== 'off',
  single:mqSingle.matches, workStarts:new Map(), workRanges:new Map(), focusWorkId:null
};

function readSetting(k,f){try{return localStorage.getItem(k) || f}catch{return f}}
function writeSetting(k,v){try{localStorage.setItem(k,String(v))}catch{}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function metaDate(w){const bits=[]; if(w.date_written) bits.push(`Written ${w.date_written}`); if(w.date_revised) bits.push(`Revised ${w.date_revised}`); return bits.join(' • ')}
function titleOf(w){return w.display_title || w.title || 'Untitled'}
function splitStory(text, firstLimit=(state.single?820:1400), nextLimit=(state.single?930:1850)){
  const paras=String(text).replace(/\r/g,'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean); const pages=[]; let bucket=[]; let size=0; let limit=firstLimit;
  const flush=()=>{if(bucket.length){pages.push(bucket.join('\n\n'));bucket=[];size=0;limit=nextLimit}};
  for(const p0 of paras){
    let p=p0;
    while(p.length>limit){
      const words=p.split(/\s+/); let chunk=''; let cut=0;
      for(let i=0;i<words.length;i++){const candidate=(chunk?chunk+' ':'')+words[i]; if(candidate.length>Math.max(650,limit-size) && chunk){cut=i;break} chunk=candidate}
      if(!cut) cut=Math.max(1,Math.floor(words.length*.55));
      const head=words.slice(0,cut).join(' '), tail=words.slice(cut).join(' ');
      if(size && size+head.length>limit) flush();
      bucket.push(head); size+=head.length+2; flush(); p=tail;
    }
    if(size && size+p.length>limit) flush(); bucket.push(p); size+=p.length+2;
  }
  flush(); return pages.length?pages:[''];
}
function splitPoem(text){
  const lines=String(text).replace(/\r/g,'').split('\n'); const pages=[]; let i=0; let cap=state.single?15:25;
  while(i<lines.length){let end=Math.min(lines.length,i+cap); pages.push(lines.slice(i,end).join('\n')); i=end; cap=state.single?19:29}
  return pages.length?pages:[''];
}
function buildPages(){
  const pages=[{kind:'title',label:'Title Page'},{kind:'about',label:'About This Collection'}];
  const addTocPages=(group,label)=>{
    const items=library.works.filter(w=>w.work_type===group); const perPage=state.single?(group==='poem'?8:7):items.length;
    for(let i=0;i<items.length;i+=perPage) pages.push({kind:'toc',group,label,items:items.slice(i,i+perPage),tocPart:Math.floor(i/perPage)+1,tocParts:Math.ceil(items.length/perPage)});
  };
  addTocPages('poem','Poetry Contents'); addTocPages('short_story','Short Stories Contents');
  state.workStarts.clear(); state.workRanges.clear();
  for(const work of library.works){
    const chunks=work.work_type==='poem'?splitPoem(work.content):splitStory(work.content);
    const start=pages.length; state.workStarts.set(work.id,start);
    chunks.forEach((chunk,i)=>pages.push({kind:'work',work,chunk,part:i+1,parts:chunks.length,label:titleOf(work)}));
    state.workRanges.set(work.id,{start,end:pages.length-1});
  }
  if(pages.length%2) pages.push({kind:'blank',label:'Endpaper'});
  state.pages=pages;
}
function currentStep(){return state.single?1:2}
function normalizedCursor(i){i=clamp(i,0,Math.max(0,state.pages.length-1)); return state.single?i:i-(i%2)}
function pageNumber(index){return index+1}
function pageWork(index){const p=state.pages[index]; return p&&p.kind==='work'?p.work:null}
function pageMarkup(page,index){
  if(!page) return '<div class="page-inner"><div class="blank-page"></div></div>';
  const num=`<div class="page-number">${pageNumber(index)}</div>`;
  if(page.kind==='title') return `<div class="page-inner"><div class="title-page"><div><div class="title-mark">✦</div><h2>William Saville</h2><h3>Poetry &amp; Short Stories</h3><p class="byline">A collection of ${library.counts.poems} poems and ${library.counts.short_stories} short stories</p></div></div>${num}<div class="page-corner-hint"></div></div>`;
  if(page.kind==='about') return `<div class="page-inner"><div class="page-scroll front-note"><h2>About This Collection</h2><div class="ornament"></div><p>This book gathers the complete poetry and short-story writing supplied with this edition into one parchment-style reading volume.</p><div class="stats"><div><strong>${library.counts.poems}</strong>Poems</div><div><strong>${library.counts.short_stories}</strong>Short Stories</div><div><strong>${library.counts.works}</strong>Total Works</div></div><p>Use the Contents panel or search box to jump directly to a work. Turn pages with the buttons, arrow keys, or by dragging the outer edge of a page toward the binding.</p><p>The page-turn sound can be switched on or off from the toolbar.</p></div>${num}<div class="page-corner-hint"></div></div>`;
  if(page.kind==='toc'){
    const works=page.items || library.works.filter(w=>w.work_type===page.group); const heading=page.group==='poem'?'Poetry':'Short Stories'; const sectionNote=page.tocParts>1?` <span>(${page.tocPart} of ${page.tocParts})</span>`:'';
    return `<div class="page-inner"><div class="page-scroll contents-page"><div class="running-head"><span>Contents</span><span>${heading}</span></div><h2>${heading}${sectionNote}</h2><div class="ornament"></div>${works.map(w=>`<div class="toc-row"><button type="button" data-work-jump="${escapeHtml(w.id)}">${escapeHtml(titleOf(w))}</button><span class="dots"></span><span>${pageNumber(state.workStarts.get(w.id))}</span></div>${w.date_written?`<div class="toc-date">${escapeHtml(w.date_written)}</div>`:''}`).join('')}</div>${num}<div class="page-corner-hint"></div></div>`;
  }
  if(page.kind==='blank') return `<div class="page-inner"><div class="blank-page">Finis</div>${num}<div class="page-corner-hint"></div></div>`;
  const w=page.work; const head=`<div class="running-head"><span>${w.work_type==='poem'?'Poetry':'Short Story'}</span><span>${escapeHtml(titleOf(w))}</span></div>`;
  const title=page.part===1?`<h2 class="work-title">${escapeHtml(titleOf(w))}</h2><div class="work-meta">${escapeHtml(metaDate(w))}</div><div class="ornament"></div>`:`<div class="continued">${escapeHtml(titleOf(w))} — continued</div>`;
  let body='';
  if(w.work_type==='poem') body=`<div class="poem-body">${escapeHtml(page.chunk)}</div>`;
  else body=`<div class="story-body">${page.chunk.split(/\n\n/).map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</div>`;
  return `<div class="page-inner"><div class="page-scroll">${head}${title}${body}</div>${num}<div class="page-corner-hint"></div></div>`;
}
function renderCurrent(){
  if(!state.open) return;
  state.cursor=normalizedCursor(state.cursor);
  if(state.single){
    els.left.innerHTML=''; els.right.innerHTML=pageMarkup(state.pages[state.cursor],state.cursor);
    els.left.style.display='none'; els.right.style.display='block';
  }else{
    els.left.style.display='block'; els.right.style.display='block';
    els.left.innerHTML=pageMarkup(state.pages[state.cursor],state.cursor);
    els.right.innerHTML=pageMarkup(state.pages[state.cursor+1],state.cursor+1);
  }
  bindPageJumps(); updateStatus(); updateButtons(); updateIndexCurrent(); applyTurnCursors();
}
function bindPageJumps(){document.querySelectorAll('[data-work-jump]').forEach(btn=>btn.addEventListener('click',()=>goToWork(btn.dataset.workJump)))}
function visibleWork(){const candidates=[pageWork(state.cursor),pageWork(state.cursor+1)].filter(Boolean);return candidates.find(w=>w.id===state.focusWorkId)||candidates[0]||null}
function updateStatus(){
  const last=Math.min(state.pages.length,state.cursor+currentStep()); const first=state.cursor+1; const w=visibleWork(); els.status.textContent=`Page${last>first?'s':''} ${first}${last>first?'–'+last:''} of ${state.pages.length}${w?' • '+titleOf(w):''}`;
}
function updateButtons(){const step=currentStep(); const hasPrev=state.cursor>0,hasNext=state.cursor+step<state.pages.length; [els.prev,els.prevB].forEach(b=>b.disabled=!hasPrev||state.turning); [els.next,els.nextB].forEach(b=>b.disabled=!hasNext||state.turning)}
function applyTurnCursors(){els.left.classList.toggle('turn-ready-prev',!state.single&&state.cursor>0); els.right.classList.toggle('turn-ready-next',state.cursor+currentStep()<state.pages.length); if(state.single) els.right.classList.toggle('turn-ready-prev',state.cursor>0)}
function renderIndex(){
  const term=state.search; const matches=library.works.filter(w=>!term || [titleOf(w),w.date_written,w.date_revised,w.content].filter(Boolean).join(' ').toLowerCase().includes(term));
  const group=(type,name)=>{const rows=matches.filter(w=>w.work_type===type); if(!rows.length)return''; return `<section class="index-group"><h3>${name}</h3>${rows.map(w=>`<button class="index-link" type="button" data-index-work="${escapeHtml(w.id)}">${escapeHtml(titleOf(w))}<small>${escapeHtml(w.date_written||'Undated')}</small></button>`).join('')}</section>`};
  els.mini.innerHTML=group('poem','Poetry')+group('short_story','Short Stories') || '<p>No writing matched your search.</p>'; els.count.textContent=`${matches.length} of ${library.works.length} works`;
  els.mini.querySelectorAll('[data-index-work]').forEach(b=>b.addEventListener('click',()=>goToWork(b.dataset.indexWork))); updateIndexCurrent();
}
function updateIndexCurrent(){const w=visibleWork(); els.mini.querySelectorAll('[data-index-work]').forEach(b=>b.classList.toggle('is-current',!!w&&b.dataset.indexWork===w.id))}
function goToWork(id){const p=state.workStarts.get(id); if(Number.isInteger(p)){state.focusWorkId=id;state.open=true;els.shell.classList.add('is-open');state.cursor=normalizedCursor(p);renderCurrent()}}
function openBook(){state.focusWorkId=null;state.open=true;els.shell.classList.add('is-open');state.cursor=0;renderCurrent()}
function closeBook(){if(state.turning)return;state.open=false;els.shell.classList.remove('is-open');els.status.textContent='Closed cover';updateButtons()}
function goContents(){if(!state.open)openBook(); state.focusWorkId=null; const first=state.pages.findIndex(p=>p.kind==='toc'); state.cursor=normalizedCursor(first>=0?first:0); renderCurrent()}
function playFlipSound(progress=0){if(!state.sound)return; try{els.audio.pause();els.audio.currentTime=Math.min(.16,Math.max(0,progress*.10));els.audio.volume=.48;const p=els.audio.play();if(p&&p.catch)p.catch(()=>{})}catch{}}
function setSound(on){state.sound=!!on;writeSetting('writing-book-sound',state.sound?'on':'off');els.sound.textContent=`Sound: ${state.sound?'On':'Off'}`;els.sound.setAttribute('aria-pressed',state.sound?'true':'false')}
function setZoom(v){state.zoom=clamp(Math.round(v*100)/100,.72,1.55);writeSetting('writing-book-zoom',state.zoom);document.documentElement.style.setProperty('--book-zoom',state.zoom);els.zoomLabel.textContent=`${Math.round(state.zoom*100)}%`}
function getTargetCursor(dir){return normalizedCursor(state.cursor+(dir==='next'?currentStep():-currentStep()))}
function canTurn(dir){return dir==='next'?state.cursor+currentStep()<state.pages.length:state.cursor>0}
function prepareTurn(dir){
  if(state.turning||!canTurn(dir))return null; const target=getTargetCursor(dir); state.turning=true;updateButtons(); els.book.classList.add('is-turning'); els.sheet.className=`turn-sheet active ${dir}`;
  const front=els.sheet.querySelector('.sheet-front'),back=els.sheet.querySelector('.sheet-back');
  if(state.single){front.innerHTML=pageMarkup(state.pages[state.cursor],state.cursor);back.innerHTML=pageMarkup(state.pages[target],target);els.right.innerHTML=pageMarkup(state.pages[target],target)}
  else if(dir==='next'){
    front.innerHTML=pageMarkup(state.pages[state.cursor+1],state.cursor+1); back.innerHTML=pageMarkup(state.pages[target],target); els.left.innerHTML=pageMarkup(state.pages[state.cursor],state.cursor); els.right.innerHTML=pageMarkup(state.pages[target+1],target+1)
  }else{
    front.innerHTML=pageMarkup(state.pages[state.cursor],state.cursor); back.innerHTML=pageMarkup(state.pages[target+1],target+1); els.left.innerHTML=pageMarkup(state.pages[target],target); els.right.innerHTML=pageMarkup(state.pages[state.cursor+1],state.cursor+1)
  }
  applyTurnProgress(dir,0); return {dir,target,front,back};
}
function applyTurnProgress(dir,p){
  p=clamp(p,0,1); const curl=Math.pow(Math.sin(Math.PI*p),.88); const sign=dir==='next'?-1:1; const angle=sign*180*p; const lift=46*Math.pow(curl,1.45); const droop=sign*(1.35*Math.sin(Math.PI*p)+.28*Math.sin(2*Math.PI*p)); const skew=sign*.65*curl; const squeeze=1-.025*curl;
  const st=els.sheet.style;
  st.setProperty('--progress',p.toFixed(4)); st.setProperty('--curl',curl.toFixed(4));
  st.setProperty('--shadow-x',`${((.5-p)*18).toFixed(2)}px`); st.setProperty('--shadow-blur',`${(14+curl*30).toFixed(2)}px`); st.setProperty('--shadow-alpha',(0.20+curl*0.42).toFixed(3));
  st.setProperty('--paper-hi',(0.06+curl*0.18).toFixed(3)); st.setProperty('--paper-dark',(curl*0.16).toFixed(3)); st.setProperty('--paper-dark-back',(curl*0.18).toFixed(3));
  st.setProperty('--face-hi',(curl*0.26).toFixed(3)); st.setProperty('--face-dark',(curl*0.34).toFixed(3));
  st.setProperty('--ridge-a-opacity',(curl*0.95).toFixed(3)); st.setProperty('--ridge-b-opacity',(curl*0.70).toFixed(3)); st.setProperty('--ridge-a-offset',`${(2+curl*12).toFixed(2)}%`); st.setProperty('--ridge-b-offset',`${(18+curl*19).toFixed(2)}%`); st.setProperty('--ridge-skew',`${(curl*1.1).toFixed(3)}deg`);
  st.setProperty('--edge-width',`${(9+curl*24).toFixed(2)}px`); st.setProperty('--edge-opacity',(0.35+curl*0.65).toFixed(3)); st.setProperty('--edge-blur',`${(8+curl*18).toFixed(2)}px`); st.setProperty('--edge-shadow-alpha',(0.15+curl*0.24).toFixed(3)); st.setProperty('--edge-radius',`${(4+curl*18).toFixed(2)}px`);
  st.transform=`translateZ(${lift.toFixed(2)}px) rotateY(${angle.toFixed(3)}deg) rotateZ(${droop.toFixed(3)}deg) skewY(${skew.toFixed(3)}deg) scaleX(${squeeze.toFixed(4)})`;
}
function heavyEase(t){t=clamp(t,0,1); if(t<.46){const x=t/.46;return .5*Math.pow(x,1.55)}const x=(t-.46)/.54;return .5+.5*(1-Math.pow(1-x,1.85))}
function finishTurn(ctx,commit){
  if(commit){state.cursor=ctx.target;state.focusWorkId=null;} els.sheet.className='turn-sheet';els.sheet.style.transform='';els.sheet.style.removeProperty('--progress');els.sheet.style.removeProperty('--curl');els.sheet.querySelector('.sheet-front').innerHTML='';els.sheet.querySelector('.sheet-back').innerHTML='';els.book.classList.remove('is-turning');state.turning=false;state.drag=null;renderCurrent();
}
function animateFrom(ctx,from,to,duration,commit){
  const start=performance.now(); if(to===1&&from<.15)playFlipSound(from);
  function frame(now){const raw=clamp((now-start)/duration,0,1); const e=to===1?heavyEase(raw):1-heavyEase(1-raw); const p=from+(to-from)*e;applyTurnProgress(ctx.dir,p);if(raw<1)requestAnimationFrame(frame);else finishTurn(ctx,commit)} requestAnimationFrame(frame)
}
function turn(dir){const ctx=prepareTurn(dir);if(!ctx)return;playFlipSound(0);animateFrom(ctx,0,1,1420,true)}
function dragStart(ev){
  if(state.turning||!state.open||ev.button!==0||ev.target.closest('button,input,a,select,textarea'))return;
  const rect=(state.single?els.right:(ev.currentTarget)).getBoundingClientRect(); let dir=null;
  if(state.single){const local=ev.clientX-rect.left;if(local>rect.width*.57)dir='next';else if(local<rect.width*.43)dir='prev'}else dir=ev.currentTarget===els.right?'next':'prev';
  if(!dir||!canTurn(dir))return; const ctx=prepareTurn(dir); if(!ctx)return; const source=state.single?els.right:ev.currentTarget; source.setPointerCapture(ev.pointerId);state.drag={ctx,startX:ev.clientX,lastX:ev.clientX,lastT:performance.now(),progress:0,velocity:0,source,pointerId:ev.pointerId,sounded:false};ev.preventDefault()
}
function dragMove(ev){const d=state.drag;if(!d||ev.pointerId!==d.pointerId)return;const rect=d.source.getBoundingClientRect();const delta=d.ctx.dir==='next'?d.startX-ev.clientX:ev.clientX-d.startX;const p=clamp(delta/Math.max(1,rect.width),0,1);const now=performance.now();d.velocity=(p-d.progress)/Math.max(1,now-d.lastT);d.progress=p;d.lastT=now;d.lastX=ev.clientX;if(p>.045&&!d.sounded){playFlipSound(p);d.sounded=true}applyTurnProgress(d.ctx.dir,p);ev.preventDefault()}
function dragEnd(ev){const d=state.drag;if(!d||ev.pointerId!==d.pointerId)return;const commit=d.progress>.27||d.velocity>.0016;const remaining=Math.abs((commit?1:0)-d.progress);animateFrom(d.ctx,d.progress,commit?1:0,Math.max(260,920*remaining),commit)}
function bind(){
  els.open.addEventListener('click',openBook);els.coverBtn.addEventListener('click',closeBook);els.contentsBtn.addEventListener('click',goContents);els.prev.addEventListener('click',()=>turn('prev'));els.next.addEventListener('click',()=>turn('next'));els.prevB.addEventListener('click',()=>turn('prev'));els.nextB.addEventListener('click',()=>turn('next'));
  els.sound.addEventListener('click',()=>setSound(!state.sound));els.zoomOut.addEventListener('click',()=>setZoom(state.zoom-.1));els.zoomIn.addEventListener('click',()=>setZoom(state.zoom+.1));els.zoomFit.addEventListener('click',()=>setZoom(1));
  els.search.addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();renderIndex()});
  [els.left,els.right].forEach(p=>{p.addEventListener('pointerdown',dragStart);p.addEventListener('pointermove',dragMove);p.addEventListener('pointerup',dragEnd);p.addEventListener('pointercancel',dragEnd)});
  document.addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea,select'))return;if(e.key==='ArrowRight')turn('next');if(e.key==='ArrowLeft')turn('prev');if(e.key==='Home')goContents();if(e.key==='Escape')closeBook();if((e.ctrlKey||e.metaKey)&&['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='-')setZoom(state.zoom-.1);else if(e.key==='0')setZoom(1);else setZoom(state.zoom+.1)}});
  const changeMode=()=>{const old=state.single; if(old===mqSingle.matches)return; const current=pageWork(state.cursor)||pageWork(state.cursor+1); state.single=mqSingle.matches; buildPages(); state.cursor=current&&state.workStarts.has(current.id)?normalizedCursor(state.workStarts.get(current.id)):normalizedCursor(0); renderIndex(); renderCurrent()}; mqSingle.addEventListener?mqSingle.addEventListener('change',changeMode):mqSingle.addListener(changeMode)
}
function debugAudit(){
  const seen=new Map(); for(const p of state.pages){if(p.kind==='work'){seen.set(p.work.id,(seen.get(p.work.id)||'')+p.chunk.replace(/\n\n/g,'\n\n'))}} return {pageCount:state.pages.length,workCount:library.works.length,workStarts:Object.fromEntries(state.workStarts),single:state.single}
}
buildPages();bind();renderIndex();setZoom(state.zoom);setSound(state.sound);updateButtons();
window.__WRITING_BOOK__={state,library,goToWork,openBook,renderCurrent,debugAudit,pageMarkup};
})();
