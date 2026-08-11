/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(global){
'use strict';
var WF=global.WorldBuilder=global.WorldBuilder||{};
function clamp(v,a,b){return Math.max(a,Math.min(b,Number(v)||0));}
function wrapLon(v){v=Number(v)||0;while(v<-180)v+=360;while(v>=180)v-=360;return v;}
function editor(){return global.WorldBuilderEditor||null;}
function globe(){var e=editor();return e&&e.getGlobeRuntime?e.getGlobeRuntime():null;}
function viewer(){return global.WorldBuilderViewerManager||null;}
function coordinates(feature){
  feature=feature||{};
  var center=feature.center||{};
  return {
    lon:wrapLon(feature.lon!=null?feature.lon:(feature.longitude!=null?feature.longitude:(center.lon!=null?center.lon:0))),
    lat:clamp(feature.lat!=null?feature.lat:(feature.latitude!=null?feature.latitude:(center.lat!=null?center.lat:0)),-89.75,89.75),
    elevationM:Number(feature.elevationM!=null?feature.elevationM:(feature.elevation!=null?feature.elevation:0))||0
  };
}
function vectorFor(lon,lat,radius){
  if(!global.THREE||!global.THREE.Vector3)return null;
  var phi=(90-lat)*Math.PI/180;
  var theta=(lon+180)*Math.PI/180;
  return new global.THREE.Vector3(
    -radius*Math.sin(phi)*Math.cos(theta),
    radius*Math.cos(phi),
    radius*Math.sin(phi)*Math.sin(theta)
  );
}
function status(text){var el=document.getElementById('status');if(el)el.textContent=text;}
var Navigation={
  current:null,
  dive:false,
  boundGlobe:null,
  bindGlobe:function(runtime){this.boundGlobe=runtime||null;return !!runtime;},
  flyTo:function(feature,altitude){
    if(!feature)return false;
    var c=coordinates(feature),g=this.boundGlobe||globe();
    this.current=feature;
    var e=editor();
    if(feature.key&&e&&e.selectContinent)e.selectContinent(feature.key);
    if(viewer()&&viewer().setView)viewer().setView(g?'globe':'flat');
    if(g&&g.camera){
      var distance;
      if(isFinite(Number(altitude))){
        var n=Math.abs(Number(altitude));
        distance=n>50?clamp(1.015+n/6371000,1.015,12):clamp(n,1.015,12);
      }else distance=c.elevationM<0?1.055:1.75;
      var v=vectorFor(c.lon,c.lat,distance);
      if(v&&g.camera.position&&g.camera.position.copy)g.camera.position.copy(v);
      if(g.controls){
        if(g.controls.target&&g.controls.target.set)g.controls.target.set(0,0,0);
        if(g.controls.update)g.controls.update();
      }
      if(g.spinning!=null)g.spinning=false;
      status('Camera centered on '+(feature.name||feature.key||'selection')+' at '+c.lat.toFixed(2)+'°, '+c.lon.toFixed(2)+'°.');
    }else status('Selected '+(feature.name||feature.key||'location')+' in flat view; WebGL globe preview is unavailable in this browser.');
    if(WF.emit)WF.emit('selection',feature);
    return true;
  },
  enterDive:function(feature){
    if(!feature)return false;
    this.dive=true;this.current=feature;
    var c=coordinates(feature),depth=Math.max(0,-c.elevationM),distance=clamp(1.022+Math.max(0,depth)/6371000,1.022,1.18);
    var ok=this.flyTo(feature,distance);
    var layer=document.getElementById('globe-layer-mode');if(layer){layer.value=depth>0?'bathymetry':'crust';layer.dispatchEvent(new Event('change',{bubbles:true}));}
    var opacity=document.getElementById('surface-opacity');if(opacity){opacity.value=depth>0?'18':'28';opacity.dispatchEvent(new Event('input',{bubbles:true}));}
    if(WF.emit)WF.emit('dive',{active:true,feature:feature,coordinates:c});
    status((depth>0?'Ocean-depth':'Subsurface')+' focus enabled for '+(feature.name||'selection')+'.');
    return ok;
  },
  exitDive:function(){
    this.dive=false;
    var opacity=document.getElementById('surface-opacity');if(opacity){opacity.value='100';opacity.dispatchEvent(new Event('input',{bubbles:true}));}
    if(WF.emit)WF.emit('dive',{active:false,feature:this.current});
    return this.reset();
  },
  reset:function(){
    this.dive=false;
    var g=this.boundGlobe||globe();
    if(g&&g.camera){
      if(g.camera.position&&g.camera.position.set)g.camera.position.set(0,0,3.15);
      if(g.controls){if(g.controls.target&&g.controls.target.set)g.controls.target.set(0,0,0);if(g.controls.update)g.controls.update();}
      if(g.spinning!=null)g.spinning=true;
    }
    if(viewer()&&viewer().setView)viewer().setView(g?'globe':'flat');
    status(g?'Globe camera reset.':'Flat viewer reset; WebGL globe preview is unavailable in this browser.');
    if(WF.emit)WF.emit('dive',{active:false});
    return true;
  },
  getCoordinates:coordinates
};
WF.Navigation=Navigation;
document.addEventListener('worldbuilder:globe-ready',function(e){Navigation.bindGlobe(e.detail&&e.detail.globe);});
}(window));

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "navigation", "category": "viewer", "description": "Camera flight, globe focus, surface walking, ocean diving, underground navigation, and keyboard control", "capabilities": ["camera flight", "surface walk", "ocean dive", "subsurface", "keyboard navigation"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.navigation","category":"viewer","sourceFile":"js/navigation.js","companionCss":"css/navigation.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
