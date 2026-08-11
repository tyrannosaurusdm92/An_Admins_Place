/* AI-Brain generic capability extraction. Source group: legacy-capability-patterns. Original UI shell omitted; embedded logic retained. */

(function(){if(window.__bdgSharedNavInstalled)return;window.__bdgSharedNavInstalled=true;document.body.classList.add('bdg-has-global-nav');var page=(location.pathname.split('/').pop()||'index.html').toLowerCase();document.querySelectorAll('#bd-global-dropdown-nav .bdg-link').forEach(function(a){if((a.getAttribute('href')||'').toLowerCase()===page){a.classList.add('bdg-current');a.setAttribute('aria-current','page');}});function clampPos(el,x,y){var r=el.getBoundingClientRect();var maxX=Math.max(0,window.innerWidth-r.width-8);var maxY=Math.max(0,window.innerHeight-r.height-8);return{x:Math.min(Math.max(8,x),maxX),y:Math.min(Math.max(8,y),maxY)}}function restorePos(el,key,def){try{var p=JSON.parse(localStorage.getItem(key)||'null');if(p){el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'}else if(def){Object.assign(el.style,def)}}catch(e){}}function makeDrag(handle,el,key){var sx=0,sy=0,ox=0,oy=0,moved=false;if(!handle||!el)return;handle.addEventListener('pointerdown',function(ev){moved=false;var r=el.getBoundingClientRect();sx=ev.clientX;sy=ev.clientY;ox=r.left;oy=r.top;handle.setPointerCapture(ev.pointerId);ev.preventDefault()});handle.addEventListener('pointermove',function(ev){if(!handle.hasPointerCapture(ev.pointerId))return;var nx=ox+(ev.clientX-sx),ny=oy+(ev.clientY-sy);if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>3)moved=true;var p=clampPos(el,nx,ny);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'});handle.addEventListener('pointerup',function(ev){if(handle.hasPointerCapture(ev.pointerId))handle.releasePointerCapture(ev.pointerId);var r=el.getBoundingClientRect();try{localStorage.setItem(key,JSON.stringify({x:r.left,y:r.top}))}catch(e){};if(moved){ev.preventDefault();ev.stopPropagation()}},true)}var nav=document.getElementById('bd-global-dropdown-nav'),bubble=document.getElementById('bd-nav-bubble');restorePos(nav,'bdgNavPos');restorePos(bubble,'bdgBubblePos',{left:'14px',bottom:'14px'});makeDrag(document.querySelector('#bd-global-dropdown-nav .bdg-drag-handle'),nav,'bdgNavPos');makeDrag(document.querySelector('#bd-nav-bubble .bdg-bubble-core'),bubble,'bdgBubblePos');document.getElementById('bdg-hide-nav')?.addEventListener('click',function(){document.body.classList.add('bdg-nav-hidden');try{localStorage.setItem('bdgNavHidden','1')}catch(e){}});document.getElementById('bdg-show-nav')?.addEventListener('click',function(){document.body.classList.remove('bdg-nav-hidden');try{localStorage.setItem('bdgNavHidden','0')}catch(e){}});try{if(localStorage.getItem('bdgNavHidden')==='1')document.body.classList.add('bdg-nav-hidden')}catch(e){}window.addEventListener('resize',function(){[nav,bubble].forEach(function(el){if(!el)return;var r=el.getBoundingClientRect();var p=clampPos(el,r.left,r.top);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'})});var meaningfulSelector='.panel,.card,.doc-card,.focus-box,.mini-panel,.sidebar,.drawer,.box,.window,.hud,.legend,.modal,.dialog,[data-panel],[data-window],[role="dialog"]';var tray=document.getElementById('bd-unhide-tray'),list=document.getElementById('bd-unhide-list'),count=document.getElementById('bd-unhide-count');function labelFor(el,i){var h=el.querySelector&&el.querySelector('h1,h2,h3,h4,.title,.panel-title,.section-title,[aria-label]');var t=(el.getAttribute('aria-label')||el.getAttribute('data-title')||(h&&(h.textContent||h.getAttribute('aria-label')))||el.id||el.className||'Panel').toString().trim().replace(/\s+/g,' ');return t.slice(0,46)||('Panel '+(i+1))}function isHidden(el){if(!el||el.id==='bd-unhide-tray'||el.closest&&(el.closest('#bd-unhide-tray')||el.closest('#bd-global-dropdown-nav')||el.closest('#bd-nav-bubble')))return false;var cs=getComputedStyle(el);return el.hidden||cs.display==='none'||cs.visibility==='hidden'||el.classList.contains('hidden')||el.classList.contains('is-hidden')}function showEl(el){try{el.hidden=false;el.removeAttribute('hidden');el.style.display='';el.style.visibility='';el.style.opacity='';el.classList.remove('hidden','is-hidden','closed','collapsed');if(getComputedStyle(el).display==='none')el.style.display='block';el.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}refresh()}function refresh(){if(!list)return;list.innerHTML='';var found=[];document.querySelectorAll(meaningfulSelector).forEach(function(el){if(isHidden(el)&&found.indexOf(el)<0)found.push(el)});count.textContent=found.length;tray.style.display='block';if(!found.length){var none=document.createElement('span');none.style.opacity='.78';none.style.padding='7px';none.textContent='No hidden panels detected.';list.appendChild(none);return}found.slice(0,60).forEach(function(el,i){var b=document.createElement('button');b.type='button';b.textContent='Unhide: '+labelFor(el,i);b.addEventListener('click',function(){showEl(el)});list.appendChild(b)})}document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('button,a,[role="button"]');if(!b)return;var txt=(b.textContent||b.getAttribute('aria-label')||b.title||'').toLowerCase();if(/\b(hide|close|collapse|minimize|dismiss)\b|×|✕|✖/.test(txt))setTimeout(refresh,80)},true);document.getElementById('bd-unhide-all')?.addEventListener('click',function(){document.querySelectorAll(meaningfulSelector).forEach(function(el){if(isHidden(el))showEl(el)});refresh()});new MutationObserver(function(){clearTimeout(window.__bdgUnhideTimer);window.__bdgUnhideTimer=setTimeout(refresh,120)}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','style','hidden','aria-hidden']});refresh()})();



(function(){
const MONTHS=["Thoryn-Rahek","Freysethysra","Nefarokir","Thalunesh","Horundar","Raeshkul","Asethrimir","Sokhivar","Iskazunet","Bastve’enlil","Hathruna"];
const WEEKDAYS=['Valkhaday','Nebday','Sigranday','Ishtaday','Marduday','Enkirday','Anubaday'];
function pad(n){return String(n).padStart(2,'0')}
function yearStart(y){return new Date(y,0,1)}
function updateTime(){
  const now=new Date();
  const start=yearStart(now.getFullYear());
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const doy=Math.floor((today-start)/86400000)+1;
  const frac=(now-today)/86400000;
  const civicYearDay=(((doy-1+frac)/0.9045)%330+330)%330;
  const monthIndex=Math.floor(civicYearDay/30);
  const dayOfMonth=Math.floor(civicYearDay%30)+1;
  const seconds=Math.floor((civicYearDay%1)*86400);
  const bh=Math.floor(seconds/3600);
  const bm=Math.floor((seconds%3600)/60);
  const bs=seconds%60;
  const driftStart=Math.floor((new Date(now.getFullYear(),9,25)-start)/86400000)+1;
  const isDrift=doy>=driftStart;
  document.getElementById('earthTime').textContent=now.toLocaleString();
  document.getElementById('universalTime').textContent=isDrift
    ? `Universal: Drift Buffer Day ${doy-driftStart+1}`
    : `Universal: ${MONTHS[monthIndex]} ${dayOfMonth}, ${WEEKDAYS[now.getDay()]}, ${pad(bh)}:${pad(bm)}:${pad(bs)} Bh`;
}
updateTime();
setInterval(updateTime,1000);
})();



(function(){
  const pageJump=document.getElementById('bd-page-jump');
  if(pageJump){pageJump.addEventListener('change',e=>{if(e.target.value) location.href=e.target.value;});}
  const months=['Iskanora','Nebrakhamesh','Sigraveig','Mardrimir','Enkithyr','Anundar','Freyzunet','Nefarokir','Thalunesh','Horundar','Setrimir'];
  const weekdays=['Monday','Tuesday','Wednesday — Rest Day','Thursday','Friday','Saturday','Sunday'];
  const earthEl=document.getElementById('bd-earth-time'), belEl=document.getElementById('bd-universal-time'), tzSel=document.getElementById('bd-timezone-select');
  function parseOffset(v){ if(v==null) return 0; if(typeof v==='number') return Math.max(-12,Math.min(12,v)); let s=String(v).trim(); let m=s.match(/([+-]?\d{1,2})(?::?\d{2})?/); return m?Math.max(-12,Math.min(12,parseInt(m[1],10))):0; }
  function findTZ(obj){ if(!obj||typeof obj!=='object') return null; const keys=['timeZone','timezone','utcOffset','universalTimeZone','universal_timezone','settlementTimeZone','settlement_timezone']; for(const k of keys){ if(obj[k]!=null) return obj[k]; } for(const v of Object.values(obj)){ if(v&&typeof v==='object'){ const found=findTZ(v); if(found!=null) return found; } } return null; }
  function applyJSONTZ(obj){ const found=findTZ(obj); if(found!=null && tzSel){ tzSel.value=String(parseOffset(found)); localStorage.setItem('universalTimeZoneOffset',tzSel.value); tick(); } }
  try{ const saved=localStorage.getItem('universalTimeZoneOffset'); if(saved&&tzSel) tzSel.value=saved; }catch(e){}
  if(tzSel){ tzSel.addEventListener('change',()=>{try{localStorage.setItem('universalTimeZoneOffset',tzSel.value)}catch(e){} tick();}); }
  const file=document.getElementById('bd-time-json');
  if(file){ file.addEventListener('change', async ev=>{ const f=ev.target.files&&ev.target.files[0]; if(!f) return; try{applyJSONTZ(JSON.parse(await f.text()));}catch(err){alert('That JSON could not be read for a timezone field.');} }); }
  if(window.settlementData) applyJSONTZ(window.settlementData);
  function tick(){
    const now=new Date();
    if(earthEl){ earthEl.textContent=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long',year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(now); }
    const off=tzSel?parseOffset(tzSel.value):0; const shifted=new Date(now.getTime()+off*3600000);
    const epoch=Date.UTC(2025,0,1); const days=Math.floor((shifted.getTime()-epoch)/86400000); const year=1+Math.floor(Math.max(0,days)/330); const doy=((days%330)+330)%330; const month=months[Math.floor(doy/30)]; const day=1+(doy%30); const weekday=weekdays[((days%7)+7)%7];
    const hh=String(shifted.getUTCHours()).padStart(2,'0'), mm=String(shifted.getUTCMinutes()).padStart(2,'0'), ss=String(shifted.getUTCSeconds()).padStart(2,'0');
    if(belEl){ belEl.textContent=`${weekday}, ${month} ${day}, Year ${year} • ${hh}:${mm}:${ss} (UTC${off>=0?'+':''}${off})`; }
  }
  tick(); setInterval(tick,1000);
})();



(function(){
  function setShellHeight(){
    var shell=document.getElementById('universal-site-shell');
    var h=shell ? Math.ceil(shell.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--bd-shell-height', h + 'px');
  }
  function collapseDrawersOnLoad(){
    document.querySelectorAll('#universal-site-shell details.bd-drawer').forEach(function(d){ d.removeAttribute('open'); });
  }
  function wireLongTextScroll(){
    var selectors='textarea,[contenteditable="true"],.card,.doc-card,.mini-panel,.panel,.box,.module,.tool-panel,.output,.result,.description,.notes,.log,.text-box';
    document.querySelectorAll(selectors).forEach(function(el){
      el.style.maxWidth='100%';
      if(!el.style.overflowWrap) el.style.overflowWrap='anywhere';
    });
  }
  function init(){
    collapseDrawersOnLoad();
    setShellHeight();
    wireLongTextScroll();
    window.addEventListener('resize', setShellHeight, {passive:true});
    document.querySelectorAll('#universal-site-shell details').forEach(function(d){ d.addEventListener('toggle', setShellHeight); });
    setTimeout(setShellHeight, 50);
    setTimeout(setShellHeight, 300);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
