/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){
'use strict';
var STORE='worldbuilder.unified.viewer.v5';
var pins=[];
var selectedPin=null;
var currentPage='viewer';
function q(id){return document.getElementById(id);}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function toast(msg){if(global.WorldBuilderEditor&&WorldBuilderEditor.toast)WorldBuilderEditor.toast(msg);else{var t=q('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2600);}}}
function safe(s){return String(s||'worldbuilder').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[<>:"/\\|?*\x00-\x1F]/g,'-').replace(/\s+/g,'_').slice(0,90)||'worldbuilder';}
function download(name,data,type){var b=data instanceof Blob?data:new Blob([data],{type:type||'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);}
function wrapLon(v){v=Number(v)||0;while(v<-180)v+=360;while(v>=180)v-=360;return v;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function snapshot(){return global.WorldBuilderEditor&&WorldBuilderEditor.getSnapshot?WorldBuilderEditor.getSnapshot():null;}
function continentByKey(key,snap){snap=snap||snapshot();return snap&&snap.continents&&snap.continents.find(function(c){return c.key===key;});}
function pinPosition(pin,snap){
  snap=snap||snapshot();
  var c=continentByKey(pin.continentKey,snap);
  if(!c)return {x:Number(pin.x)||50,y:Number(pin.y)||50,lon:null,lat:null};
  var rx=isFinite(Number(pin.relativeX))?Number(pin.relativeX):.5;
  var ry=isFinite(Number(pin.relativeY))?Number(pin.relativeY):.5;
  var lonSpan=(Number(c.pixelWidth)||1)/(Number(c.sourceWidth)||1)*360;
  var latSpan=(Number(c.pixelHeight)||1)/(Number(c.sourceHeight)||1)*180;
  var lx=(rx-.5)*lonSpan,ly=(.5-ry)*latSpan;
  var a=(Number(c.rotation)||0)*Math.PI/180;
  var rotatedLon=lx*Math.cos(a)-ly*Math.sin(a);
  var rotatedLat=lx*Math.sin(a)+ly*Math.cos(a);
  var lon=wrapLon(Number(c.center.lon)+rotatedLon);
  var lat=clamp(Number(c.center.lat)+rotatedLat,-90,90);
  return {x:((lon+180)/360*100+100)%100,y:(90-lat)/180*100,lon:lon,lat:lat};
}
function showPage(name){
  var requested=name||'globe',legacy={viewer:'globe',terrain:'globe',imports:'globe',environment:'weather',systems:'lore',exports:'lore',superbot:currentPage||'globe'},mapped=legacy[requested]||requested;
  var target=document.getElementById('page-'+mapped);
  currentPage=target?mapped:'galaxy';
  document.querySelectorAll('.page').forEach(function(p){
    var isTarget=p.id==='page-'+currentPage;
    p.classList.toggle('active',isTarget);
    p.classList.remove('workspace-secondary');
    p.setAttribute('aria-hidden',isTarget?'false':'true');
  });
  document.querySelectorAll('.nav-link').forEach(function(b){b.classList.toggle('active',b.dataset.page===currentPage);});
  document.body.dataset.workspacePage=currentPage;
  if(global.WorldBuilderWorkspace){
    if(requested==='terrain')global.WorldBuilderWorkspace.activateGlobe('continent');
    else if(requested==='viewer')global.WorldBuilderWorkspace.activateGlobe('viewer');
    else if(requested==='imports')global.WorldBuilderWorkspace.activateGlobe('start');
    else if(requested==='systems'){var transit=document.querySelector('[data-lore-tab="transit"]');if(transit)transit.click();}
    else if(requested==='exports'){var data=document.querySelector('[data-lore-tab="data"]');if(data)data.click();}
    else if(requested==='superbot'){var dock=document.getElementById('global-superbot-dock'),toggle=document.getElementById('superbot-dock-toggle');if(dock&&!dock.classList.contains('open')&&toggle)toggle.click();}
  }
  try{localStorage.setItem(STORE+'.page',currentPage);}catch(_e){}
  setTimeout(function(){
    if(global.WorldBuilderEditor&&WorldBuilderEditor.forceResize)WorldBuilderEditor.forceResize();
    if(currentPage==='galaxy'&&global.WorldBuilderGalaxy&&WorldBuilderGalaxy.rebuild)WorldBuilderGalaxy.rebuild();
    if(currentPage==='galaxy'&&global.WorldBuilderPlanetMaps&&WorldBuilderPlanetMaps.refresh)WorldBuilderPlanetMaps.refresh();
    if(currentPage==='galaxy'&&global.WorldBuilderPlanetWalkthrough&&WorldBuilderPlanetWalkthrough.resize)WorldBuilderPlanetWalkthrough.resize();
  },80);
  window.scrollTo({top:0,behavior:'instant'});
}
function setView(mode){
  mode=mode==='globe'?'globe':'flat';
  var screen=q('viewer-screen');if(!screen)return;
  screen.classList.toggle('mode-globe',mode==='globe');screen.classList.toggle('mode-flat',mode!=='globe');
  document.querySelectorAll('.view-switch').forEach(function(b){b.classList.toggle('active',b.dataset.view===mode);});
  if(q('viewer-mode-chip'))q('viewer-mode-chip').textContent=mode.toUpperCase();
  if(q('viewer-kind-label'))q('viewer-kind-label').textContent=mode==='globe'?'Native globe / depth viewer':'Editable flat map ready';
  setTimeout(function(){if(global.WorldBuilderEditor&&WorldBuilderEditor.forceResize)WorldBuilderEditor.forceResize();},50);
}
function setViewerStatus(text){var el=q('status');if(el)el.textContent=text;}
function bindViewer(){
  document.querySelectorAll('.view-switch').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.view);});});
  var zoom=q('globe-zoom'),out=q('globe-zoom-output');
  if(zoom)zoom.addEventListener('input',function(){if(out)out.textContent=Number(zoom.value).toFixed(3)+' radii';var ok=global.WorldBuilderEditor&&WorldBuilderEditor.setGlobeDistance&&WorldBuilderEditor.setGlobeDistance(zoom.value);if(!ok)setViewerStatus('Globe zoom saved; this browser is using the flat fallback because WebGL is unavailable.');});
  var mode=q('globe-layer-mode');
  if(mode)mode.addEventListener('change',function(){if(global.WorldBuilder&&WorldBuilder.IndustrialTerrain)WorldBuilder.IndustrialTerrain.setMode(mode.value);if(mode.value==='crust')setView('globe');if(mode.value==='climate'&&q('show-weather')){q('show-weather').checked=true;q('show-weather').dispatchEvent(new Event('change',{bubbles:true}));}});
  var opacity=q('surface-opacity'),oop=q('surface-opacity-output');
  if(opacity)opacity.addEventListener('input',function(){var v=Number(opacity.value)/100;if(oop)oop.textContent=Math.round(v*100)+'%';if(global.WorldBuilder&&WorldBuilder.IndustrialTerrain)WorldBuilder.IndustrialTerrain.setSurfaceOpacity(v);});
  var reset=q('reset-camera');
  if(reset)reset.addEventListener('click',function(){var g=global.WorldBuilderEditor&&WorldBuilderEditor.getGlobeRuntime&&WorldBuilderEditor.getGlobeRuntime();if(g){g.camera.position.set(0,0,3.15);g.controls.target.set(0,0,0);g.controls.update();if(zoom){zoom.value='3.15';zoom.dispatchEvent(new Event('input',{bubbles:true}));}setViewerStatus('Globe camera reset.');}else{setView('flat');setViewerStatus('Flat-map view reset. WebGL globe preview is unavailable in this browser.');}});
  var depth=q('depth-focus');
  if(depth)depth.addEventListener('click',function(){setView('globe');if(mode){mode.value='crust';mode.dispatchEvent(new Event('change',{bubbles:true}));}if(opacity){opacity.value='24';opacity.dispatchEvent(new Event('input',{bubbles:true}));}if(zoom){zoom.value='1.06';zoom.dispatchEvent(new Event('input',{bubbles:true}));}setViewerStatus('Depth focus enabled: translucent surface, crust layers, and close camera.');});
  var map=q('map-canvas');
  if(map)map.addEventListener('pointermove',function(e){var r=map.getBoundingClientRect();if(!r.width||!r.height)return;var lon=(e.clientX-r.left)/r.width*360-180,lat=90-(e.clientY-r.top)/r.height*180;if(q('viewer-coordinate'))q('viewer-coordinate').textContent=(lat>=0?lat.toFixed(2)+'° N':Math.abs(lat).toFixed(2)+'° S')+' · '+(lon>=0?lon.toFixed(2)+'° E':Math.abs(lon).toFixed(2)+'° W');});
  var weather=q('show-weather');if(weather)weather.addEventListener('change',function(){var o=q('weather-overlay');if(o)o.style.display=weather.checked?'block':'none';});
  var relief=q('relief-overlay');if(relief)relief.style.display='block';
}
function loadPins(){try{pins=JSON.parse(localStorage.getItem(STORE+'.pins')||'[]');}catch(_e){pins=[];}renderPins();}
function savePins(){try{localStorage.setItem(STORE+'.pins',JSON.stringify(pins));}catch(_e){}}
function renderPins(snap){
  snap=snap||snapshot();
  var layer=q('pin-layer'),list=q('pin-list');
  if(layer){layer.innerHTML=pins.map(function(p){var pos=pinPosition(p,snap);p.x=pos.x;p.y=pos.y;p.longitude=pos.lon;p.latitude=pos.lat;return '<button class="wf-pin '+(p.id===selectedPin?'selected':'')+'" data-pin="'+p.id+'" style="left:'+pos.x+'%;top:'+pos.y+'%;--pin-color:'+p.color+'" title="'+String(p.name||'Pin').replace(/"/g,'&quot;')+'"></button>';}).join('');layer.querySelectorAll('[data-pin]').forEach(function(b){b.addEventListener('click',function(e){e.stopPropagation();selectedPin=b.dataset.pin;renderPins();});});}
  if(list){list.innerHTML=pins.length?pins.map(function(p){var pos=pinPosition(p,snap);return '<div class="pin-card"><strong>'+p.name+'</strong><small>'+p.type+' · '+(pos.lat==null?'unplaced':pos.lat.toFixed(2)+'°, '+pos.lon.toFixed(2)+'°')+' · attached to '+p.continentKey+'</small></div>';}).join(''):'<div class="pin-card">No generated pin slots yet.</div>';}
}
function generatePins(){
  var snap=snapshot();if(!snap)return;
  var next=[];
  snap.continents.forEach(function(c,ci){var count=Math.max(3,Math.min(10,Math.round(3+c.relativeArea*60)));for(var i=0;i<count;i++){var angle=Math.PI*2*i/count,r=.18+Math.min(.25,c.relativeArea*2.5);next.push({id:'wf-pin-'+ci+'-'+i+'-'+Date.now(),name:(i===0?'Capital of ':'Settlement in ')+c.name,type:i===0?'capital':'settlement',continentKey:c.key,relativeX:clamp(.5+Math.cos(angle)*r,.06,.94),relativeY:clamp(.5+Math.sin(angle)*r,.06,.94),color:i===0?'#DC143C':'#00ffff',createdAt:new Date().toISOString()});}});
  pins=next;savePins();renderPins(snap);toast(pins.length+' continent-attached pin slots generated.');
}
function exportPinsPayload(){var snap=snapshot();return pins.map(function(p){var pos=pinPosition(p,snap);return Object.assign({},p,{longitude:pos.lon,latitude:pos.lat,viewerX:pos.x,viewerY:pos.y,coordinateSpace:'continent_local'});});}
function bindExports(){
  var p=q('export-project-json');if(p)p.addEventListener('click',function(){var snap=snapshot();download(safe(snap&&snap.title)+'_WorldBuilder_Project.json',JSON.stringify({schema:'worldbuilder.project.v5',exportedAt:new Date().toISOString(),project:snap,pins:exportPinsPayload()},null,2));});
  var j=q('export-pins-json');if(j)j.addEventListener('click',function(){download('settlement_pin_slots.json',JSON.stringify({schema:'worldbuilder.pin_slots.v3',generatedAt:new Date().toISOString(),pins:exportPinsPayload()},null,2));});
  var g=q('export-pins-geojson');if(g)g.addEventListener('click',function(){var features=exportPinsPayload().filter(function(p){return p.longitude!=null;}).map(function(p){return{type:'Feature',id:p.id,geometry:{type:'Point',coordinates:[p.longitude,p.latitude]},properties:Object.assign({},p,{longitude:undefined,latitude:undefined})};});download('pins.geojson',JSON.stringify({type:'FeatureCollection',coordinateSpace:'WGS84_like_world_coordinates',features:features},null,2),'application/geo+json');});
  var b=q('generate-pin-slots');if(b)b.addEventListener('click',generatePins);
}
function init(){
  document.querySelectorAll('.nav-link').forEach(function(b){b.addEventListener('click',function(){showPage(b.dataset.page);});});
  bindViewer();loadPins();bindExports();
  var page='galaxy';try{page=localStorage.getItem(STORE+'.page')||'galaxy';}catch(_e){}
  showPage(page);setView('flat');
  var spl=q('show-pin-layer');if(spl)spl.addEventListener('change',function(){if(q('pin-layer'))q('pin-layer').style.display=spl.checked?'block':'none';});
}
document.addEventListener('DOMContentLoaded',init);
document.addEventListener('worldbuilder:project-change',function(e){renderPins(e.detail&&e.detail.snapshot);});
global.WorldBuilderViewerManager={showPage:showPage,setView:setView,getCurrentPage:function(){return currentPage;},getPins:function(){return clone(exportPinsPayload());},generatePins:generatePins,refreshPins:renderPins,pinPosition:pinPosition};
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.viewer_manager","category":"viewer","sourceFile":"js/viewer_manager.js","companionCss":"css/viewer_manager.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
