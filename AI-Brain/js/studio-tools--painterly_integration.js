/* Genericized for AI-Brain capability use. Provenance group: world-life-simulation-a. */

(function(){'use strict';
const brand=document.documentElement.dataset.projectBrand||'WorldBuilder';
const host=document.createElement('div');host.id='ourspaceVisualForge';host.innerHTML=`<button type="button" class="vf-toggle">Painterly & 3D Map Tools</button><div class="vf-panel"><a href="website.html">Open ${brand} Website Shell</a><a href="tools/painterly-map-lab.html">Open Painterly Map & Globe Lab</a><a href="effects-studio/studio.html">Open 3D Visual Studio</a><label>Quick weather <select class="vf-weather"><option>None</option><option>Rain</option><option>Fog</option><option>Night</option></select></label><label>Painterly contrast <input class="vf-filter" type="range" min="0" max="100" value="15"></label><small>Quick effects are non-destructive previews. Use the Map Lab or Visual Studio for exportable layers.</small></div>`;document.body.appendChild(host);
host.querySelector('.vf-toggle').onclick=()=>host.classList.toggle('open');
function targets(){return Array.from(document.querySelectorAll('canvas,img,svg')).filter(el=>{const r=el.getBoundingClientRect();return r.width>300&&r.height>200&&r.bottom>0&&r.top<innerHeight})}
host.querySelector('.vf-filter').oninput=e=>{const v=Number(e.target.value)/100;targets().forEach(el=>el.style.filter=`saturate(${1+v*.7}) contrast(${1+v*.45}) drop-shadow(0 8px 14px rgba(0,0,0,${.15+v*.2}))`)};
host.querySelector('.vf-weather').onchange=e=>{document.body.classList.remove('vf-weather-rain','vf-weather-fog','vf-weather-night');if(e.target.value!=='None')document.body.classList.add('vf-weather-'+e.target.value.toLowerCase())};
window.addEventListener('message',e=>{if(e.data?.type!=='ourspace.painterlyMap')return;try{localStorage.setItem('ourspace.painterlyMap',JSON.stringify(e.data))}catch(_){}window.dispatchEvent(new CustomEvent('ourspace:painterly-map-imported',{detail:e.data}))});
})();
