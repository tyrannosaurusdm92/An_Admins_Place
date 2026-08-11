/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  'use strict';
  var WF = global.WorldBuilder = global.WorldBuilder || {};
  var Terrain = WF.IndustrialTerrain = WF.IndustrialTerrain || {};
  var state = { globe: null, textureCanvas: null, heightMap: null, width: 512, height: 256, bathyCanvas: null, reliefCanvas: null, mode: 'surface', timer: null, shells: [] };
  function q(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hash(x, y, seed) { var n = Math.sin(x * 127.1 + y * 311.7 + seed * 17.13) * 43758.5453123; return n - Math.floor(n); }
  function read(id, fallback) { var el = q(id); return el ? Number(el.value || fallback) : fallback; }
  function colorWater(r, g, b) { return b > r * 1.08 && (b > g * .92 || g > r * 1.22); }
  function rebuildHeightMap() {
    var source = state.textureCanvas || q('texture-canvas');
    if (!source || !source.width) return null;
    state.textureCanvas = source;
    var sample = document.createElement('canvas'); sample.width = state.width; sample.height = state.height;
    var sctx = sample.getContext('2d', {willReadFrequently:true}); sctx.drawImage(source, 0, 0, state.width, state.height);
    var pixels = sctx.getImageData(0, 0, state.width, state.height).data;
    var relief = read('industrial-relief', 72) / 100;
    var erosion = read('erosion-strength', 58) / 100;
    var volcanism = read('volcanism', 42) / 100;
    var bathy = read('bathymetry-detail', 76) / 100;
    var map = new Float32Array(state.width * state.height);
    for (var y=0;y<state.height;y++) for (var x=0;x<state.width;x++) {
      var i=(y*state.width+x)*4, r=pixels[i], g=pixels[i+1], b=pixels[i+2];
      var lat=Math.abs(90-y/state.height*180)/90;
      var n1=hash(x*.11,y*.11,7), n2=hash(x*.027,y*.027,19), n3=hash(x*.41,y*.41,31);
      if (colorWater(r,g,b)) {
        var blue=clamp((b-r)/190,0,1), shelf=clamp((g-r)/130,0,1);
        var depth=180 + blue*5200*bathy + (1-shelf)*3400*bathy + n2*1600*bathy;
        if (n3 > .985-volcanism*.012) depth *= .46;
        map[y*state.width+x]=-clamp(depth,40,11000);
      } else {
        var brown=clamp((r-g+80)/170,0,1), green=clamp((g-r+90)/180,0,1), light=(r+g+b)/765;
        var mountain=Math.pow(n2,3)*4600*relief + brown*2500*relief + Math.max(0,.55-light)*2300;
        var plain=80+green*680+(1-lat)*320+n1*420;
        var elevation=plain+mountain;
        elevation *= 1-erosion*.18*(.35+n1*.65);
        if (n3 > .992-volcanism*.018) elevation += 1800+volcanism*3600;
        map[y*state.width+x]=clamp(elevation,0,12000);
      }
    }
    state.heightMap=smoothMap(map, state.width, state.height, Math.round(1+erosion*3));
    buildCanvases(); updateGlobe(); drawReliefOverlay(); updateDiagnostics();
    try { document.dispatchEvent(new CustomEvent('worldbuilder:industrial-terrain', {detail:{width:state.width,height:state.height,heightMap:state.heightMap}})); } catch(_e){}
    return state.heightMap;
  }
  function smoothMap(input,w,h,passes){ var a=input,b=new Float32Array(input.length); for(var p=0;p<passes;p++){ for(var y=0;y<h;y++)for(var x=0;x<w;x++){var sum=0,weight=0;for(var oy=-1;oy<=1;oy++)for(var ox=-1;ox<=1;ox++){var xx=(x+ox+w)%w,yy=clamp(y+oy,0,h-1),wt=(ox===0&&oy===0)?4:1;sum+=a[yy*w+xx]*wt;weight+=wt;}b[y*w+x]=sum/weight;}var t=a;a=b;b=t;}return a; }
  function buildCanvases(){
    var bath=document.createElement('canvas'), rel=document.createElement('canvas'); bath.width=rel.width=state.width; bath.height=rel.height=state.height;
    var bctx=bath.getContext('2d'), rctx=rel.getContext('2d'), bi=bctx.createImageData(state.width,state.height), ri=rctx.createImageData(state.width,state.height);
    for(var y=0;y<state.height;y++)for(var x=0;x<state.width;x++){var idx=y*state.width+x,h=state.heightMap[idx],p=idx*4;
      if(h<0){var d=clamp(-h/11000,0,1),s=clamp(1-(-h)/1800,0,1);bi.data[p]=Math.round(8+28*s);bi.data[p+1]=Math.round(25+90*s-12*d);bi.data[p+2]=Math.round(48+120*s-8*d);}else{var e=clamp(h/9000,0,1);bi.data[p]=Math.round(35+110*e);bi.data[p+1]=Math.round(73+90*(1-e));bi.data[p+2]=Math.round(48+60*(1-e));}bi.data[p+3]=255;
      var left=state.heightMap[y*state.width+((x-1+state.width)%state.width)], right=state.heightMap[y*state.width+((x+1)%state.width)], up=state.heightMap[Math.max(0,y-1)*state.width+x], down=state.heightMap[Math.min(state.height-1,y+1)*state.width+x];
      var shade=clamp(128+(left-right)*.025+(up-down)*.035,25,230);ri.data[p]=ri.data[p+1]=ri.data[p+2]=shade;ri.data[p+3]=h<0?80:115;
    }bctx.putImageData(bi,0,0);rctx.putImageData(ri,0,0);state.bathyCanvas=bath;state.reliefCanvas=rel;
  }
  function updateGlobe(){
    var globe=state.globe || (global.WorldBuilderEditor&&global.WorldBuilderEditor.getGlobeRuntime&&global.WorldBuilderEditor.getGlobeRuntime()); if(!globe||!state.heightMap)return; state.globe=globe;
    var geometry=globe.sphere.geometry, pos=geometry.attributes.position, uv=geometry.attributes.uv, base=globe.basePositions; if(!base||base.length!==pos.array.length){base=new Float32Array(pos.array);globe.basePositions=base;}
    var reliefScale=read('terrain-relief',1), depthScale=read('ocean-depth-exaggeration',1);
    for(var i=0;i<pos.count;i++){var u=uv.getX(i),v=uv.getY(i),x=Math.min(state.width-1,Math.floor(u*state.width)),y=Math.min(state.height-1,Math.floor((1-v)*state.height)),h=state.heightMap[y*state.width+x],scale=h>=0?reliefScale:depthScale,rad=1+h/6371000*scale;var bx=base[i*3],by=base[i*3+1],bz=base[i*3+2],len=Math.hypot(bx,by,bz)||1;pos.array[i*3]=bx/len*rad;pos.array[i*3+1]=by/len*rad;pos.array[i*3+2]=bz/len*rad;}
    pos.needsUpdate=true;geometry.computeVertexNormals();
    if(!globe.surfaceTexture){globe.surfaceTexture=globe.texture;globe.bathyTexture=new THREE.Texture(state.bathyCanvas);globe.bathyTexture.minFilter=THREE.LinearFilter;globe.bathyTexture.magFilter=THREE.LinearFilter;globe.bathyTexture.needsUpdate=true;}
    if(globe.bathyTexture){globe.bathyTexture.image=state.bathyCanvas;globe.bathyTexture.needsUpdate=true;}
    applyMode(state.mode);
  }
  function ensureShells(){var globe=state.globe;if(!globe||state.shells.length)return;var defs=[[.985,0x5d4a22,.45],[.82,0x8d701d,.34],[.58,0xd06135,.42],[.34,0xffd084,.62]];defs.forEach(function(d,i){var shell=new THREE.Mesh(new THREE.SphereGeometry(d[0],96,64),new THREE.MeshPhongMaterial({color:d[1],transparent:true,opacity:d[2],side:THREE.DoubleSide,depthWrite:false}));shell.visible=false;globe.scene.add(shell);state.shells.push(shell);});}
  function applyMode(mode){state.mode=mode||'surface';var globe=state.globe;if(!globe)return;ensureShells();var mat=globe.sphere.material;mat.map=(state.mode==='bathymetry'||state.mode==='crust')?globe.bathyTexture:globe.surfaceTexture;mat.needsUpdate=true;var opacity=read('surface-opacity',100)/100;mat.transparent=opacity<.999||state.mode==='crust';mat.opacity=state.mode==='crust'?Math.min(opacity,.32):opacity;state.shells.forEach(function(s){s.visible=state.mode==='crust';});if(globe.atmosphere)globe.atmosphere.visible=state.mode!=='crust';drawReliefOverlay();}
  function drawReliefOverlay(){var target=q('relief-overlay');if(!target||!state.reliefCanvas)return;target.width=state.textureCanvas?state.textureCanvas.width:2048;target.height=state.textureCanvas?state.textureCanvas.height:1024;var ctx=target.getContext('2d');ctx.clearRect(0,0,target.width,target.height);if(state.mode==='relief'||state.mode==='bathymetry'||state.mode==='crust'){ctx.globalAlpha=state.mode==='bathymetry'?.72:.38;ctx.globalCompositeOperation=state.mode==='bathymetry'?'source-over':'soft-light';ctx.drawImage(state.mode==='bathymetry'?state.bathyCanvas:state.reliefCanvas,0,0,target.width,target.height);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;}}
  function updateDiagnostics(){var el=q('terrain-diagnostics');if(!el||!state.heightMap)return;var min=Infinity,max=-Infinity,land=0;for(var i=0;i<state.heightMap.length;i++){var h=state.heightMap[i];if(h>=0)land++;if(h<min)min=h;if(h>max)max=h;}el.className='feature-summary success';el.innerHTML='<strong>Industrial terrain active</strong><div>'+Math.round(land/state.heightMap.length*100)+'% land · peak '+Math.round(max).toLocaleString()+' m · trench '+Math.round(min).toLocaleString()+' m · '+state.width+' × '+state.height+' relief samples.</div>';}
  function schedule(){clearTimeout(state.timer);state.timer=setTimeout(rebuildHeightMap,140);}
  function bindRange(id,output,format){var el=q(id),out=q(output);if(!el)return;function update(){if(out)out.textContent=format(Number(el.value));schedule();}el.addEventListener('input',update);update();}
  Terrain.rebuild=rebuildHeightMap;Terrain.setMode=applyMode;Terrain.setSurfaceOpacity=function(v){var globe=state.globe;if(globe){globe.sphere.material.transparent=v<1;globe.sphere.material.opacity=v;globe.sphere.material.needsUpdate=true;}};Terrain.getHeightMap=function(){return state.heightMap;};Terrain.getBathymetryCanvas=function(){return state.bathyCanvas;};
  document.addEventListener('worldbuilder:globe-ready',function(e){state.globe=e.detail.globe;state.textureCanvas=e.detail.textureCanvas;setTimeout(rebuildHeightMap,120);});
  document.addEventListener('worldbuilder:project-change',schedule);document.addEventListener('worldbuilder:ready',schedule);
  document.addEventListener('DOMContentLoaded',function(){bindRange('industrial-relief','industrial-relief-output',function(v){return v+'%';});bindRange('erosion-strength','erosion-output',function(v){return v+'%';});bindRange('volcanism','volcanism-output',function(v){return v+'%';});bindRange('bathymetry-detail','bathymetry-detail-output',function(v){return v+'%';});bindRange('terrain-relief','terrain-relief-output',function(v){return v.toFixed(2)+'×';});bindRange('ocean-depth-exaggeration','ocean-depth-output',function(v){return v.toFixed(2)+'×';});var b=q('rebuild-industrial-terrain');if(b)b.addEventListener('click',rebuildHeightMap);var s=q('smooth-industrial-terrain');if(s)s.addEventListener('click',function(){if(state.heightMap){state.heightMap=smoothMap(state.heightMap,state.width,state.height,3);buildCanvases();updateGlobe();drawReliefOverlay();updateDiagnostics();}});});
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.industrial_terrain","category":"terrain","sourceFile":"js/industrial_terrain.js","companionCss":"css/industrial_terrain.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
