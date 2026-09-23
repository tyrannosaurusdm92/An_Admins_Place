(()=>{
'use strict';
const root=document.documentElement;
const surface=document.getElementById('merged-luxury-editorial__website-surface');
if(!surface)return;
const $=(s,r=surface)=>r.querySelector(s);
const $$=(s,r=surface)=>Array.from(r.querySelectorAll(s));
const STORE={
  get(k,d=null){try{const v=localStorage.getItem(k);return v===null?d:v}catch(_){return d}},
  set(k,v){try{localStorage.setItem(k,String(v))}catch(_){}}
};
const pageMeta=[
  ['home','Start'],
  ['about','Housing Context'],
  ['resources','Documents + Sources'],
  ['contact','Reference Form']
];
const validPages=new Set(pageMeta.map(x=>x[0]));
const pages=$$('.site-page');
const routes=$$('.page-route');
const master=$('#web-luxury-editorial-desktop-shell--masterNav');
const current=$('#web-luxury-editorial-desktop-shell--masterCurrent');

function activatePage(id,push=true){
  if(!validPages.has(id))id='home';
  const target=$(`.site-page[data-page-id="${CSS.escape(id)}"]`);
  if(!target)return;
  pages.forEach(p=>p.classList.toggle('is-active',p===target));
  routes.forEach(r=>r.classList.toggle('is-current',r.dataset.page===id));
  const idx=pageMeta.findIndex(x=>x[0]===id);
  current.textContent=`${String(idx+1).padStart(2,'0')} · ${pageMeta[idx][1]}`;
  STORE.set('retroUniversal.activePage',id);
  if(push){
    setAdminHashVisibility(false);
    history.replaceState(null,'',`#${id}`);
  }
  window.scrollTo({top:0,behavior:'instant'});
  $$('.jump-nav').forEach(j=>j.classList.remove('open'));
}
routes.forEach(r=>r.addEventListener('click',()=>activatePage(r.dataset.page)));
function setAdminHashVisibility(show){
  const admin=document.getElementById('reference-admin');
  if(!admin)return;
  admin.hidden=!show;
  admin.setAttribute('aria-hidden',String(!show));
}
function routeFromHash(){
  const id=location.hash.slice(1);
  const isAdmin=id==='admin';
  setAdminHashVisibility(isAdmin);
  if(isAdmin){
    activatePage('resources',false);
    requestAnimationFrame(()=>document.getElementById('reference-admin')?.scrollIntoView({behavior:'smooth',block:'start'}));
    return;
  }
  if(validPages.has(id))activatePage(id,false);
}
const requested=location.hash.slice(1);
const stored=STORE.get('retroUniversal.activePage','home');
const initialPage=requested==='admin'?'resources':(validPages.has(requested)?requested:(validPages.has(stored)?stored:'home'));
activatePage(initialPage,false);
setAdminHashVisibility(requested==='admin');
if(requested==='admin')requestAnimationFrame(()=>document.getElementById('reference-admin')?.scrollIntoView({block:'start'}));
window.addEventListener('hashchange',routeFromHash);

const modeButton=$('#web-luxury-editorial-desktop-shell--masterModeToggle');
function setMode(mode){
  mode=mode==='dark'?'dark':'light';
  root.dataset.mode=mode;
  root.style.colorScheme=mode;
  surface.dataset.mode=mode;
  const dark=mode==='dark';
  if(modeButton){
    modeButton.setAttribute('aria-pressed',String(dark));
    modeButton.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
    modeButton.title=dark?'Switch to light mode':'Switch to dark mode';
    modeButton.textContent=dark?'☀':'☾';
  }
  STORE.set('retroUniversal.mode',mode);
}
setMode(STORE.get('retroUniversal.mode','light'));
modeButton?.addEventListener('click',()=>setMode(surface.dataset.mode==='dark'?'light':'dark'));

const masterToggle=$('#web-luxury-editorial-desktop-shell--masterToggle');
const masterHandle=$('#web-luxury-editorial-desktop-shell--masterHandle');
function setMasterCollapsed(collapsed){
  collapsed=!!collapsed;
  master?.classList.toggle('collapsed',collapsed);
  if(masterToggle){
    masterToggle.textContent=collapsed?'+':'-';
    masterToggle.setAttribute('aria-expanded',String(!collapsed));
    masterToggle.setAttribute('aria-label',collapsed?'Expand master navigation':'Collapse master navigation');
    masterToggle.title=collapsed?'Expand navigation':'Collapse navigation';
  }
  if(masterHandle){
    masterHandle.setAttribute('aria-expanded',String(!collapsed));
    masterHandle.setAttribute('aria-label',collapsed?'Drag or expand master navigation':'Drag master navigation');
    masterHandle.title=collapsed?'Drag to move | click to expand':'Drag to move master navigation';
  }
  STORE.set('retroUniversal.masterCollapsed',collapsed?'1':'0');
}
masterToggle?.addEventListener('click',()=>setMasterCollapsed(!master.classList.contains('collapsed')));
setMasterCollapsed(STORE.get('retroUniversal.masterCollapsed')==='1');

const routeSearch=$('#web-luxury-editorial-desktop-shell--routeSearch');
routeSearch?.addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  routes.forEach((r,i)=>{r.hidden=!!q&&!(`${i+1} ${r.textContent}`.toLowerCase().includes(q))});
});

function dragElement(el,handle,key,defaults){
  if(!el||!handle)return ()=>{};
  let drag=false,moved=false,sx=0,sy=0,bx=0,by=0;
  const saved=STORE.get(key,'');
  if(saved){try{const p=JSON.parse(saved);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto'}catch(_){}}
  handle.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    drag=true;moved=false;sx=e.clientX;sy=e.clientY;
    const r=el.getBoundingClientRect();bx=r.left;by=r.top;
    try{handle.setPointerCapture(e.pointerId)}catch(_){}
  });
  handle.addEventListener('pointermove',e=>{
    if(!drag)return;
    const dx=e.clientX-sx,dy=e.clientY-sy;
    if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
    if(!moved)return;
    const x=Math.max(4,Math.min(innerWidth-el.offsetWidth-4,bx+dx));
    const y=Math.max(4,Math.min(innerHeight-el.offsetHeight-4,by+dy));
    el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';
  });
  handle.addEventListener('pointerup',e=>{
    if(!drag)return;drag=false;
    try{handle.releasePointerCapture(e.pointerId)}catch(_){}
    if(moved){const r=el.getBoundingClientRect();STORE.set(key,JSON.stringify({x:r.left,y:r.top}))}
    else if(defaults?.click)defaults.click();
  });
  return ()=>{
    el.style.left=defaults.left;
    el.style.top=defaults.top;
    el.style.right=defaults.right||'auto';
    STORE.set(key,'');
  };
}
const resetMaster=dragElement(master,masterHandle,'retroUniversal.masterPos',{
  left:'12px',top:'12px',right:'auto',click:()=>{if(master.classList.contains('collapsed'))setMasterCollapsed(false)}
});
$('#web-luxury-editorial-desktop-shell--resetMasterNav')?.addEventListener('click',()=>{resetMaster();setMasterCollapsed(false)});

const jumpResets=[];
$$('.jump-nav').forEach(j=>{
  const orb=$('.jump-orb',j),page=j.dataset.jumpNav;
  const reset=dragElement(j,orb,`retroUniversal.jumpPos.${page}`,{
    left:'auto',right:'16px',top:'22vh',click:()=>j.classList.toggle('open')
  });
  jumpResets.push(reset);
  $('.jump-panel',j)?.addEventListener('pointerdown',e=>e.stopPropagation());
});
$('#web-luxury-editorial-desktop-shell--resetJumpNav')?.addEventListener('click',()=>jumpResets.forEach(fn=>fn()));
$$('.jump-link').forEach(b=>b.addEventListener('click',()=>{
  const t=document.getElementById(b.dataset.target);
  if(t)t.scrollIntoView({behavior:'smooth',block:'start'});
  b.closest('.jump-nav')?.classList.remove('open');
}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.jump-nav').forEach(j=>j.classList.remove('open'))});
})();