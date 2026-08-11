/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */

(function(){
'use strict';
const R=window.WFRegistry;
function hashString(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rngFrom(seed){let a=(typeof seed==='number'?seed:hashString(String(seed)))>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function hash2(x,y,seed){let n=Math.imul((x|0)^seed,374761393)+Math.imul((y|0)^seed,668265263);n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295}
function smooth(t){return t*t*(3-2*t)}
function valueNoise(x,y,seed,scale){x/=scale;y/=scale;const x0=Math.floor(x),y0=Math.floor(y),tx=smooth(x-x0),ty=smooth(y-y0);const a=hash2(x0,y0,seed),b=hash2(x0+1,y0,seed),c=hash2(x0,y0+1,seed),d=hash2(x0+1,y0+1,seed);return (a+(b-a)*tx)+((c+(d-c)*tx)-(a+(b-a)*tx))*ty}
function noise(x,y,seed){return valueNoise(x,y,seed,90)*.55+valueNoise(x,y,seed+77,34)*.3+valueNoise(x,y,seed+151,13)*.15}
function hexToRgb(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
function rgba(rgb,a=1){return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function pointSegDist(p,a,b){const vx=b.x-a.x,vy=b.y-a.y,wx=p.x-a.x,wy=p.y-a.y;const c1=vx*wx+vy*wy;if(c1<=0)return Math.hypot(wx,wy);const c2=vx*vx+vy*vy;if(c2<=c1)return Math.hypot(p.x-b.x,p.y-b.y);const t=c1/c2;return Math.hypot(p.x-(a.x+t*vx),p.y-(a.y+t*vy))}
function profileById(id){return R.biomes.find(b=>b.id===id)}
function makeCenters(n,rng){if(n<=1)return [{x:.5,y:.5}];if(n===2)return [{x:.29+rng()*.06,y:.43+rng()*.15},{x:.71-rng()*.06,y:.57-rng()*.15}];return [{x:.27+rng()*.05,y:.27+rng()*.07},{x:.73-rng()*.05,y:.35+rng()*.08},{x:.48+rng()*.08,y:.73-rng()*.05}]}
function regionIndexAt(model,x,y){let best=0,bestScore=Infinity;for(let i=0;i<model.centers.length;i++){const c=model.centers[i];let score=Math.hypot((x-c.x)*1.03,(y-c.y)*.97);score+=(noise(x*800,y*800,model.seed+i*97)-.5)*.19;score+=Math.sin((x*7+y*5+i)*2.1)*.018;if(score<bestScore){bestScore=score;best=i}}return best}
function pointInRegion(model,p,idx){return regionIndexAt(model,p.x,p.y)===idx}
function roleTags(role,profile){const tags=new Set(['settlement-node','buildable','accessible']);
  const add=(...xs)=>xs.forEach(x=>tags.add(x));
  if(role.includes('residential')) add('residential-suitable','quiet');
  if(role.includes('market')) add('market','central');
  if(role.includes('civic')) add('civic','central');
  if(role.includes('industrial')) add('industrial','edge');
  if(role.includes('transit')||role.includes('ropeway')||role.includes('pass')) add('transit','route');
  if(role.includes('platform')) add('platform','walkway','water-access');
  if(role==='dock'||role.includes('waterfront')||role==='shore') add('dock','waterfront','water-access');
  if(role.includes('habitat')) add('habitat','pressure-safe','residential-suitable','water-access');
  if(role.includes('reef')) add('reef-nature','nature','scenic','water-access');
  if(role.includes('kelp')) add('kelp-farm','water-access');
  if(role.includes('shellfish')) add('shellfish-farm','water-access');
  if(role.includes('farmland')||role==='field') add('farmland','arable');
  if(role.includes('orchard')) add('orchard','arable','scenic');
  if(role.includes('pasture')) add('pasture','arable');
  if(role.includes('mushroom')) add('mushroom-farm','chamber');
  if(role.includes('resource')||role==='salvage') add('resource','industrial','edge');
  if(role.includes('terrace')) add('terrace','residential-suitable');
  if(role.includes('chamber')) add('chamber','residential-suitable');
  if(role.includes('canopy')) add('canopy','ropeway');
  if(role==='canopy-residential') add('canopy','canopy-residential','residential-suitable','ropeway');
  if(role==='floor-clearing'||role==='clearing') add('clearing','residential-suitable','nature');
  if(role.includes('stilt')) add('stilt','waterfront','water-access');
  if(role==='stilt-residential') add('stilt','stilt-residential','residential-suitable','water-access');
  if(role.includes('nature')||role==='forest-edge') add('nature','scenic','wilderness');
  if(role==='hidden') add('hidden','edge');
  if(role==='pressure-gate') add('pressure-gate','transit','edge');
  if(role==='riverfront') add('riverfront','water-access','scenic');
  if(role==='settlement-core') add('settlement-core','central','residential-suitable','civic');
  profile.traits.forEach(t=>tags.add(t));
  return [...tags]
}
function createNodes(model,size){const rng=model.rng;const scale=Math.max(1,Math.sqrt(size.averageLocations/32));const perRegion=Math.round(6+scale*4);for(let ri=0;ri<model.profiles.length;ri++){const p=model.profiles[ri];let made=0,attempts=0;while(made<perRegion&&attempts<perRegion*60){attempts++;const c=model.centers[ri];const a=rng()*Math.PI*2,rad=Math.sqrt(rng())*(.22+.05*rng());const point={x:Math.max(.055,Math.min(.945,c.x+Math.cos(a)*rad)),y:Math.max(.065,Math.min(.935,c.y+Math.sin(a)*rad))};if(!pointInRegion(model,point,ri))continue;if(model.nodes.some(n=>dist(n,point)<.045))continue;const role=p.nodeRoles[made%p.nodeRoles.length];const radius=.027+rng()*.024+(size.order*.002);model.nodes.push({id:`n${ri}_${made}`,x:point.x,y:point.y,radius,role,profileId:p.id,region:ri,tags:roleTags(role,p)});made++}}
  // One shared central civic node that is always buildable.
  const ci=regionIndexAt(model,.5,.5),cp=model.profiles[ci];model.nodes.push({id:'central',x:.5,y:.5,radius:.055,role:'settlement-core',profileId:cp.id,region:ci,tags:roleTags('settlement-core',cp)});
}
function createRoutes(model,size){const nodes=[...model.nodes].sort((a,b)=>dist(a,{x:.5,y:.5})-dist(b,{x:.5,y:.5}));const central=nodes.find(n=>n.id==='central')||nodes[0];const connected=[central];for(const n of nodes){if(n===central)continue;let nearest=connected[0],d=dist(n,nearest);for(const c of connected){const nd=dist(n,c);if(nd<d){d=nd;nearest=c}}const mid={x:(n.x+nearest.x)/2+(model.rng()-.5)*.035,y:(n.y+nearest.y)/2+(model.rng()-.5)*.035};model.routes.push({a:{x:n.x,y:n.y},m:mid,b:{x:nearest.x,y:nearest.y},kind:routeKind(n,nearest,model)});connected.push(n)}
  // Radial exits for visible transport geometry.
  for(let i=0;i<size.routeBranches;i++){const ang=(Math.PI*2*i/size.routeBranches)+model.rng()*.25;const edge={x:.5+Math.cos(ang)*.48,y:.5+Math.sin(ang)*.45};model.routes.push({a:{x:.5,y:.5},m:{x:.5+Math.cos(ang)*.24+(model.rng()-.5)*.05,y:.5+Math.sin(ang)*.22+(model.rng()-.5)*.05},b:edge,kind:'main'})}
}
function routeKind(a,b,model){const tags=new Set([...a.tags,...b.tags]);if(tags.has('platform'))return'walkway';if(tags.has('canopy'))return'ropeway';if(tags.has('stilt'))return'boardwalk';if(tags.has('underwater'))return'current-lane';if(tags.has('cavern'))return'tunnel';if(tags.has('mountain'))return'pass';return'road'}
function createModel(opts){const seed=hashString(String(opts.seed||'template'));const rng=rngFrom(seed);const profiles=opts.biomeIds.map(profileById).filter(Boolean);const size=R.sizes.find(s=>s.id===opts.sizeKey)||R.sizes[0];const model={seed,rng,profiles,centers:makeCenters(profiles.length,rng),nodes:[],routes:[],size};createNodes(model,size);createRoutes(model,size);return model}
function nearestNode(model,x,y){let best=null,bd=Infinity;for(const n of model.nodes){const d=Math.hypot(x-n.x,y-n.y);if(d<bd){bd=d;best=n}}return [best,bd]}
function nearestRoute(model,x,y){let bd=Infinity;for(const r of model.routes){const d=Math.min(pointSegDist({x,y},r.a,r.m),pointSegDist({x,y},r.m,r.b));if(d<bd)bd=d}return bd}
function boundaryWaterAccess(model,x,y,ri){const p=model.profiles[ri],samples=[[.018,0],[-.018,0],[0,.018],[0,-.018]];for(const [dx,dy] of samples){const oi=regionIndexAt(model,Math.max(0,Math.min(1,x+dx)),Math.max(0,Math.min(1,y+dy)));if(oi!==ri){const op=model.profiles[oi];if(p.traits.some(t=>['aquatic','coastal','water','wetland'].includes(t))||op.traits.some(t=>['aquatic','coastal','water','wetland'].includes(t)))return true}}return false}
function tagsAt(model,x,y){const ri=regionIndexAt(model,x,y),profile=model.profiles[ri],tags=new Set(profile.traits);const [node,nd]=nearestNode(model,x,y);if(node&&nd<=node.radius*1.25)node.tags.forEach(t=>tags.add(t));else tags.add('wilderness');const rd=nearestRoute(model,x,y);if(rd<.018){tags.add('route');tags.add('accessible');if(!tags.has('open-water'))tags.add('buildable')}
  if(Math.hypot(x-.5,y-.5)<.23)tags.add('central');if(x<.14||x>.86||y<.15||y>.85)tags.add('edge');
  if(boundaryWaterAccess(model,x,y,ri)){tags.add('shore');tags.add('waterfront');tags.add('water-access')}
  if(profile.traits.includes('aquatic')&&!tags.has('habitat')&&!tags.has('platform')&&!tags.has('reef-nature'))tags.add('open-water');
  if(profile.kind==='marsh'&&!tags.has('stilt')&&!tags.has('route'))tags.add('bog');
  if(profile.kind==='mountain'&&!tags.has('terrace')&&!tags.has('route')&&!tags.has('settlement-core'))tags.add('cliff');
  if(profile.kind==='cavern'&&!tags.has('chamber')&&!tags.has('route')&&!tags.has('settlement-core'))tags.add('cave-wall');
  if(['deep_forest','rainforest'].includes(profile.kind)&&!tags.has('clearing')&&!tags.has('settlement-core')&&!tags.has('route'))tags.add('dense-wilderness');
  if(profile.kind==='farming'&&!tags.has('settlement-core')&&!tags.has('residential-suitable')&&!tags.has('route'))tags.add('farmland');
  if(tags.has('buildable')&&!tags.has('industrial')&&!tags.has('farmland')&&!tags.has('hazard'))tags.add('quiet');
  return {profile,tags:[...tags],nearestNode:node,routeDistance:rd}
}
function candidatePoints(model,target){const points=[];const gridX=38,gridY=28;for(let gy=0;gy<gridY;gy++)for(let gx=0;gx<gridX;gx++){const x=.035+(gx+model.rng()*.72)/gridX*.93,y=.045+(gy+model.rng()*.72)/gridY*.91;const info=tagsAt(model,x,y);if(info.tags.includes('buildable')||info.tags.includes('nature')||info.tags.includes('farmland')||info.tags.includes('water-access'))points.push({x,y,...info})}
  for(const n of model.nodes){for(let k=0;k<9;k++){const a=model.rng()*Math.PI*2,r=n.radius*(.15+model.rng()*.78),x=n.x+Math.cos(a)*r,y=n.y+Math.sin(a)*r;const info=tagsAt(model,x,y);points.push({x,y,...info})}}
  return points
}
function drawBase(ctx,model,W,H){const low=document.createElement('canvas');low.width=360;low.height=270;const lc=low.getContext('2d'),im=lc.createImageData(low.width,low.height),data=im.data;const pals=model.profiles.map(p=>p.palette.map(hexToRgb));for(let y=0;y<low.height;y++)for(let x=0;x<low.width;x++){const nx=x/(low.width-1),ny=y/(low.height-1),ri=regionIndexAt(model,nx,ny),p=pals[ri],n=noise(x*4,y*4,model.seed+ri*17),idx=Math.min(p.length-2,Math.floor(n*(p.length-1))),t=n*(p.length-1)-idx,rgb=mix(p[idx],p[idx+1],t);const o=(y*low.width+x)*4;data[o]=rgb[0];data[o+1]=rgb[1];data[o+2]=rgb[2];data[o+3]=255}lc.putImageData(im,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(low,0,0,W,H);ctx.save();ctx.globalAlpha=.13;ctx.globalCompositeOperation='overlay';for(let i=0;i<1000;i++){const x=model.rng()*W,y=model.rng()*H,r=1+model.rng()*5;ctx.fillStyle=model.rng()>.5?'#fff':'#000';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}ctx.restore()}
function pathCurve(ctx,r,W,H){ctx.beginPath();ctx.moveTo(r.a.x*W,r.a.y*H);ctx.quadraticCurveTo(r.m.x*W,r.m.y*H,r.b.x*W,r.b.y*H)}
function drawRoutes(ctx,model,W,H){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';for(const r of model.routes){let outer='#332918aa',inner='#c5a970aa',ow=10,iw=4;if(r.kind==='walkway'){outer='#2a1f17bb';inner='#c49a5aaa';ow=13;iw=7}else if(r.kind==='ropeway'){outer='#15120fbb';inner='#c6ad7a';ow=5;iw=2}else if(r.kind==='boardwalk'){outer='#251d15bb';inner='#b88b55';ow=11;iw=6}else if(r.kind==='current-lane'){outer='#c6ffff22';inner='#d8ffff66';ow=8;iw=2}else if(r.kind==='tunnel'){outer='#090909cc';inner='#9b8065aa';ow=14;iw=5}else if(r.kind==='pass'){outer='#302e2bbb';inner='#c7b9a0aa';ow=12;iw=5}ctx.strokeStyle=outer;ctx.lineWidth=ow;pathCurve(ctx,r,W,H);ctx.stroke();ctx.strokeStyle=inner;ctx.lineWidth=iw;pathCurve(ctx,r,W,H);ctx.stroke()}ctx.restore()}
function drawFeatureNode(ctx,n,p,W,H,rng){const x=n.x*W,y=n.y*H,r=n.radius*Math.min(W,H);ctx.save();
  if(p.kind==='ocean_surface'){ctx.fillStyle='#8a6c42';ctx.strokeStyle='#d7ba79';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=r*(.75+rng()*.3),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;(k?ctx.lineTo(px,py):ctx.moveTo(px,py))}ctx.closePath();ctx.fill();ctx.stroke();for(let i=-2;i<=2;i++){ctx.strokeStyle='#4d3825aa';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-r*.6,y+i*r*.23);ctx.lineTo(x+r*.6,y+i*r*.23);ctx.stroke()}}
  else if(p.kind==='underwater_reef'){ctx.fillStyle='#76a99055';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();for(let i=0;i<12;i++){const a=rng()*Math.PI*2,rr=rng()*r*.9,cx=x+Math.cos(a)*rr,cy=y+Math.sin(a)*rr;ctx.strokeStyle=['#ff9f7c','#e9d06f','#a985c8','#7ec3a1'][i%4];ctx.lineWidth=2+rng()*4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+(rng()-.5)*8,cy-8-rng()*14);ctx.stroke()}}
  else if(p.kind==='underwater_open'){ctx.fillStyle='#6b7f8755';ctx.strokeStyle='#9fb4b777';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,r*1.1,r*.7,rng()*1.5,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<5;i++){ctx.fillStyle='#98d8d844';ctx.beginPath();ctx.arc(x+(rng()-.5)*r, y-(rng()*r*1.2),2+rng()*4,0,Math.PI*2);ctx.fill()}}
  else if(['treetops','tree_floor'].includes(p.kind)&&n.tags.includes('canopy')){ctx.fillStyle='#244c2e';ctx.strokeStyle='#7ea55a';ctx.lineWidth=2;for(let i=0;i<7;i++){const a=i*Math.PI*2/7,rr=r*.45;ctx.beginPath();ctx.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,r*.55,0,Math.PI*2);ctx.fill();ctx.stroke()}ctx.fillStyle='#80603b';ctx.beginPath();ctx.arc(x,y,r*.32,0,Math.PI*2);ctx.fill()}
  else if(p.kind==='marsh'){ctx.fillStyle='#756d4caa';ctx.strokeStyle='#b89d62';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,r*1.05,r*.65,rng(),0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<8;i++){ctx.strokeStyle='#4f673f';ctx.beginPath();ctx.moveTo(x+(rng()-.5)*r*1.8,y+(rng()-.5)*r);ctx.lineTo(x+(rng()-.5)*r*1.8,y-r*.8-rng()*8);ctx.stroke()}}
  else if(p.kind==='cavern'){ctx.fillStyle='#27242bdd';ctx.strokeStyle='#8f7d6b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,r*1.1,r*.72,rng(),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#73b6aa55';ctx.beginPath();ctx.ellipse(x+r*.2,y+r*.18,r*.35,r*.16,0,0,Math.PI*2);ctx.fill()}
  else if(p.kind==='mountain'){ctx.fillStyle='#77736d99';ctx.strokeStyle='#c4bfb5aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-r,y+r*.55);ctx.lineTo(x-r*.15,y-r);ctx.lineTo(x+r,y+r*.55);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d9d5c9aa';ctx.beginPath();ctx.moveTo(x-r*.38,y-r*.2);ctx.lineTo(x-r*.15,y-r);ctx.lineTo(x+r*.2,y-r*.1);ctx.closePath();ctx.fill()}
  else if(n.tags.includes('farmland')){ctx.save();ctx.translate(x,y);ctx.rotate((rng()-.5)*.5);ctx.fillStyle='#9f984f99';ctx.fillRect(-r,-r*.7,r*2,r*1.4);ctx.strokeStyle='#d2c36f99';ctx.lineWidth=1;for(let i=-4;i<=4;i++){ctx.beginPath();ctx.moveTo(-r,i*r*.14);ctx.lineTo(r,i*r*.14);ctx.stroke()}ctx.restore()}
  else if(n.tags.includes('orchard')){ctx.fillStyle='#78924b77';ctx.beginPath();ctx.ellipse(x,y,r*1.1,r*.8,0,0,Math.PI*2);ctx.fill();for(let i=0;i<9;i++){ctx.fillStyle='#3d6735';ctx.beginPath();ctx.arc(x+(rng()-.5)*r*1.6,y+(rng()-.5)*r,3+rng()*5,0,Math.PI*2);ctx.fill()}}
  else if(['deep_forest','rainforest','partial_forest','farm_forest_grass'].includes(p.kind)&&n.tags.includes('nature')){for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#275c32cc':'#3c7940cc';ctx.beginPath();ctx.arc(x+(rng()-.5)*r*1.7,y+(rng()-.5)*r*1.4,4+rng()*8,0,Math.PI*2);ctx.fill()}}
  else {ctx.fillStyle='#d0bd8355';ctx.strokeStyle='#f0d9a077';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,r,r*.72,rng(),0,Math.PI*2);ctx.fill();ctx.stroke()}
  ctx.restore()}
function drawBiomeDetails(ctx,model,W,H){ctx.save();for(let i=0;i<model.nodes.length;i++){const n=model.nodes[i],p=profileById(n.profileId);drawFeatureNode(ctx,n,p,W,H,rngFrom(model.seed+i*331))}
  // decorative region-specific marks
  const r=rngFrom(model.seed+999);for(let i=0;i<320;i++){const x=r()*W,y=r()*H,ri=regionIndexAt(model,x/W,y/H),p=model.profiles[ri];ctx.save();ctx.globalAlpha=.25+r()*.25;if(['deep_forest','rainforest','partial_forest','tree_floor','farm_forest_grass'].includes(p.kind)){ctx.fillStyle=r()>.5?'#153f25':'#376e39';ctx.beginPath();ctx.arc(x,y,2+r()*6,0,Math.PI*2);ctx.fill()}else if(['grassland','prairie','farming','valley','beach_grass'].includes(p.kind)){ctx.strokeStyle=r()>.5?'#e2cf78':'#4e7337';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(r()-.5)*4,y-4-r()*8);ctx.stroke()}else if(p.traits.includes('aquatic')||p.kind==='beach_reef'){ctx.strokeStyle='#d9ffff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,3+r()*9,Math.PI*.1,Math.PI*.9);ctx.stroke()}ctx.restore()}ctx.restore()}
function drawBoundaries(ctx,model,W,H){ctx.save();ctx.globalAlpha=.13;ctx.strokeStyle='#fff4c7';ctx.lineWidth=2;for(let y=10;y<H;y+=12)for(let x=10;x<W;x+=12){const a=regionIndexAt(model,x/W,y/H),b=regionIndexAt(model,(x+12)/W,y/H),c=regionIndexAt(model,x/W,(y+12)/H);if(a!==b||a!==c){ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.stroke()}}ctx.restore()}
function drawZoneOverlay(ctx,model,W,H){ctx.save();ctx.font='12px Georgia';ctx.textAlign='center';for(const n of model.nodes){ctx.fillStyle='#ffeaa322';ctx.strokeStyle='#ffeaa377';ctx.lineWidth=1;ctx.beginPath();ctx.arc(n.x*W,n.y*H,n.radius*Math.min(W,H),0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#fff2c7cc';ctx.fillText(n.role.replaceAll('-',' '),n.x*W,n.y*H)}ctx.restore()}
function draw(canvas,model,options={}){const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);drawBase(ctx,model,W,H);drawBiomeDetails(ctx,model,W,H);if(options.routes!==false)drawRoutes(ctx,model,W,H);drawBoundaries(ctx,model,W,H);if(options.zones)drawZoneOverlay(ctx,model,W,H);ctx.save();const grad=ctx.createRadialGradient(W*.5,H*.45,W*.15,W*.5,H*.5,W*.75);grad.addColorStop(0,'rgba(255,244,205,0.06)');grad.addColorStop(1,'rgba(0,0,0,0.38)');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.restore()}
window.WFTerrainEngine={createModel,tagsAt,candidatePoints,draw,regionIndexAt,rngFrom,hashString};
})();
