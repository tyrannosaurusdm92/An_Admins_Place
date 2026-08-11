/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){
  'use strict';
  const U=global.WFUtil,C=global.WF_CATALOG;
  const W=1600,H=1200;
  const nameRoots=['Amber','Ash','Bramble','Bright','Cedar','Cloud','Copper','Dawn','Deep','Fern','Fox','Glass','Green','Harbor','High','Hollow','Iron','Juniper','Lake','Moon','Moss','North','Oak','Pearl','Rain','Reed','River','Rose','Silver','Stone','Sun','Thorn','Tide','Vale','Willow','Wind'];
  const nameEnds=['gate','haven','rest','cross','market','watch','hall','house','garden','landing','works','archive','exchange','wharf','commons','station','grove','terrace','circle','court'];

  function getBiome(id){return C.biomes.find(b=>b.id===id)||C.biomes[0]}
  function getSize(id){return C.settlementSizes.find(s=>s.id===id)||C.settlementSizes[2]}
  function getEra(id){return C.eras.find(e=>e.id===id)||C.eras[3]}
  function paletteFor(b){const p=global.WF_REFERENCE_PALETTES?.[b.id]||[];const usable=p.filter(hex=>{const c=U.hexToRgb(hex),lum=.2126*c.r+.7152*c.g+.0722*c.b;return lum>48&&lum<220});const ref=usable[0]||p[0]||b.base;return[U.mixColor(b.base,ref,.28),U.lighten(b.base,.18),U.darken(b.base,.14),b.accent,...usable.slice(1,5)]}

  function zoneCenters(count,rng){
    if(count===1)return[{x:W*.5,y:H*.5,r:Math.max(W,H),phase:0}];
    const presets=count===2?[[.32,.5],[.72,.48]]:[[.28,.35],[.7,.3],[.51,.75]];
    return presets.map(([x,y],i)=>({x:(x+(rng()-.5)*.08)*W,y:(y+(rng()-.5)*.08)*H,r:(.46+rng()*.12)*Math.min(W,H),phase:rng()*9+i*2.7}));
  }

  function paintZoneBackground(ctx,biomes,centers,seed,texture=true){
    const sw=400,sh=300,small=document.createElement('canvas');small.width=sw;small.height=sh;const sx=small.getContext('2d');const image=sx.createImageData(sw,sh);const d=image.data;
    const colors=biomes.map(b=>U.hexToRgb(paletteFor(b)[0]||b.base));
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
      const wx=x/sw*W,wy=y/sh*H;let rs=0,gs=0,bs=0,sum=0;
      for(let i=0;i<centers.length;i++){
        const c=centers[i],dx=wx-c.x,dy=wy-c.y;
        const wave=Math.sin((wx+seed*.7)*.006+c.phase)+Math.cos((wy-seed*.3)*.008-c.phase)*.7;
        const dist=Math.hypot(dx,dy)*(1+wave*.055);
        const weight=1/Math.pow(90+dist,1.72);
        rs+=colors[i].r*weight;gs+=colors[i].g*weight;bs+=colors[i].b*weight;sum+=weight;
      }
      const n=(U.noise2(x*.65,y*.65,seed)-.5)*18+(U.noise2(x*.13,y*.13,seed+55)-.5)*12;
      const edge=Math.hypot(wx-W/2,wy-H/2)/Math.hypot(W/2,H/2);
      const idx=(y*sw+x)*4;
      d[idx]=U.clamp(rs/sum+n-edge*8,0,255);d[idx+1]=U.clamp(gs/sum+n-edge*6,0,255);d[idx+2]=U.clamp(bs/sum+n-edge*4,0,255);d[idx+3]=255;
    }
    sx.putImageData(image,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(small,0,0,W,H);
    const vignette=ctx.createRadialGradient(W*.48,H*.43,100,W*.5,H*.5,980);vignette.addColorStop(0,'rgba(255,246,218,.08)');vignette.addColorStop(.68,'rgba(20,24,18,.03)');vignette.addColorStop(1,'rgba(7,12,9,.25)');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
    if(texture){
      const rng=U.rng(seed+901);ctx.save();ctx.globalCompositeOperation='soft-light';
      for(let i=0;i<21000;i++){const x=rng()*W,y=rng()*H,a=.015+rng()*.04,s=.35+rng()*1.4;ctx.fillStyle=rng()>.55?`rgba(255,248,224,${a})`:`rgba(26,22,18,${a})`;ctx.fillRect(x,y,s,s)}
      ctx.restore();
    }
  }

  function irregularBlob(ctx,cx,cy,rx,ry,rng,fill,stroke=null,points=24){ctx.beginPath();for(let i=0;i<=points;i++){const a=i/points*Math.PI*2;const m=.82+rng()*.28;const x=cx+Math.cos(a)*rx*m,y=cy+Math.sin(a)*ry*m;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
  function curvedPath(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);if(pts.length===3)ctx.quadraticCurveTo(pts[1].x,pts[1].y,pts[2].x,pts[2].y);else for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y)}

  function drawWaterFeatures(ctx,b,center,rng,seed){
    const ocean=b.id.startsWith('ocean.');
    if(ocean){ctx.save();ctx.globalAlpha=.22;for(let i=0;i<48;i++){const y=rng()*H;ctx.strokeStyle=i%2?'rgba(220,247,242,.23)':'rgba(5,43,57,.3)';ctx.lineWidth=1+rng()*2;ctx.beginPath();ctx.moveTo(0,y);for(let x=0;x<=W;x+=80)ctx.lineTo(x,y+Math.sin(x*.012+i)*6);ctx.stroke()}ctx.restore();return}
    if(b.id.includes('beach-and')){
      ctx.save();const side=center.x<W/2?'left':'right';const x0=side==='left'?0:W;const grad=ctx.createLinearGradient(side==='left'?0:W*.7,0,side==='left'?W*.65:W,0);grad.addColorStop(0,'rgba(25,113,139,.94)');grad.addColorStop(.7,'rgba(55,142,154,.72)');grad.addColorStop(1,'rgba(225,199,145,.22)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x0,0);for(let y=0;y<=H;y+=55){const x=(side==='left'?W*.22:W*.78)+Math.sin(y*.012+seed)*60+(rng()-.5)*25;ctx.lineTo(x,y)}ctx.lineTo(x0,H);ctx.closePath();ctx.fill();ctx.restore();return}
    if(['mountains.valley','forest.rainforest','forest.deep-lush-forest','forest.partial-forest','plains.grassland','hybrid.hybrid-farming-forest-grassland'].includes(b.id)){
      const pts=[{x:center.x-500,y:-40},{x:center.x-120+(rng()-.5)*150,y:H*.48},{x:center.x+340,y:H+40}];ctx.save();ctx.lineCap='round';curvedPath(ctx,pts);ctx.strokeStyle='rgba(41,91,103,.6)';ctx.lineWidth=32;ctx.stroke();curvedPath(ctx,pts);ctx.strokeStyle='rgba(86,154,161,.72)';ctx.lineWidth=20;ctx.stroke();curvedPath(ctx,pts);ctx.strokeStyle='rgba(213,239,224,.25)';ctx.lineWidth=3;ctx.stroke();ctx.restore();
    }
  }

  function drawTrees(ctx,b,center,rng,count=160){
    const dense=b.id.includes('rainforest')||b.id.includes('deep-lush')||b.id.includes('treetops');
    for(let i=0;i<count*(dense?1.4:1);i++){
      const a=rng()*Math.PI*2,rad=Math.sqrt(rng())*(dense?570:500),x=center.x+Math.cos(a)*rad,y=center.y+Math.sin(a)*rad*.75;
      if(x<10||x>W-10||y<10||y>H-10)continue;
      const s=(dense?7:5)+rng()*(dense?13:9),green=U.pick(rng,['#1f4f35','#2f6540','#3f7650','#557f51','#6e8c55','#294d38']);
      ctx.fillStyle='rgba(16,24,17,.22)';ctx.beginPath();ctx.ellipse(x+3,y+5,s*1.05,s*.8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=U.withAlpha(green,.76);ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(183,207,143,.18)';ctx.beginPath();ctx.arc(x-s*.25,y-s*.3,s*.38,0,Math.PI*2);ctx.fill();
      if(b.id.includes('treetops')&&rng()>.78){ctx.strokeStyle='rgba(125,87,53,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,s*.55,0,Math.PI*2);ctx.stroke()}
    }
  }

  function drawMountains(ctx,b,center,rng,count=58){
    for(let i=0;i<count;i++){
      const x=center.x+(rng()-.5)*950,y=center.y+(rng()-.5)*760,s=15+rng()*46;
      ctx.fillStyle='rgba(29,31,29,.2)';ctx.beginPath();ctx.moveTo(x-s,y+s*.62);ctx.lineTo(x+4,y-s);ctx.lineTo(x+s,y+s*.62);ctx.closePath();ctx.fill();
      ctx.fillStyle=U.pick(rng,['rgba(105,102,87,.6)','rgba(119,117,101,.64)','rgba(78,83,76,.66)','rgba(143,132,109,.52)']);ctx.beginPath();ctx.moveTo(x-s,y+s*.45);ctx.lineTo(x,y-s);ctx.lineTo(x+s,y+s*.45);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(236,229,207,.22)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x-s*.3,y-s*.18);ctx.lineTo(x-s*.08,y-s*.26);ctx.lineTo(x+s*.26,y+s*.42);ctx.stroke();
    }
  }

  function drawFields(ctx,center,rng,count=34){
    for(let i=0;i<count;i++){const x=center.x+(rng()-.5)*900,y=center.y+(rng()-.5)*680,w=55+rng()*130,h=35+rng()*90,a=(rng()-.5)*.5;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=U.pick(rng,['rgba(156,142,65,.48)','rgba(120,134,63,.52)','rgba(176,135,65,.45)','rgba(101,126,62,.5)']);ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeStyle='rgba(230,213,160,.22)';ctx.lineWidth=1;for(let yy=-h/2+6;yy<h/2;yy+=7){ctx.beginPath();ctx.moveTo(-w/2,yy);ctx.lineTo(w/2,yy);ctx.stroke()}ctx.restore()}
  }

  function drawMarsh(ctx,center,rng,count=42){
    for(let i=0;i<count;i++){const x=center.x+(rng()-.5)*950,y=center.y+(rng()-.5)*720,rx=20+rng()*75,ry=12+rng()*40;ctx.fillStyle=U.pick(rng,['rgba(45,105,100,.46)','rgba(62,117,103,.42)','rgba(37,84,83,.47)']);ctx.beginPath();ctx.ellipse(x,y,rx,ry,rng(),0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(155,164,111,.44)';ctx.lineWidth=1;for(let j=0;j<8;j++){const xx=x-rx+rng()*rx*2;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx+(rng()-.5)*5,y-8-rng()*18);ctx.stroke()}}
  }

  function drawReefs(ctx,center,rng,count=95){
    const cols=['#d58d78','#d0ad61','#b66ca1','#6db4a8','#8a74b8','#e1b57c'];
    for(let i=0;i<count;i++){const x=center.x+(rng()-.5)*980,y=center.y+(rng()-.5)*760,s=3+rng()*10;ctx.fillStyle=U.withAlpha(U.pick(rng,cols),.62);ctx.beginPath();for(let j=0;j<6;j++){const a=j/6*Math.PI*2,r=s*(.7+rng()*.5),px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.closePath();ctx.fill();if(rng()>.75){ctx.strokeStyle='rgba(239,232,193,.35)';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rng()-.5)*12,y-8-rng()*15);ctx.stroke()}}
  }

  function drawCavern(ctx,center,rng){
    ctx.save();ctx.fillStyle='rgba(5,8,11,.62)';ctx.fillRect(0,0,W,H);for(let i=0;i<28;i++){irregularBlob(ctx,center.x+(rng()-.5)*1100,center.y+(rng()-.5)*800,70+rng()*190,50+rng()*130,rng,'rgba(58,62,63,.45)','rgba(143,130,105,.18)',18)}for(let i=0;i<14;i++){const x=center.x+(rng()-.5)*850,y=center.y+(rng()-.5)*630,r=15+rng()*60,g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,'rgba(83,220,225,.45)');g.addColorStop(1,'rgba(16,87,111,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}ctx.restore();
  }

  function drawTerrain(ctx,biomes,centers,rng,seed){
    biomes.forEach((b,i)=>{
      const c=centers[i];drawWaterFeatures(ctx,b,c,rng,seed+i*97);
      if(b.id.includes('forest')||b.id.includes('rainforest')||b.id.includes('tree'))drawTrees(ctx,b,c,rng,b.id.includes('partial')?100:180);
      if(b.id.includes('mountain')||b.id.includes('valley'))drawMountains(ctx,b,c,rng,b.id.includes('valley')?34:64);
      if(b.id.includes('farming'))drawFields(ctx,c,rng,44);
      if(b.id.includes('grassland')||b.id.includes('prairie')){
        drawTrees(ctx,b,c,rng,b.id.includes('prairie')?38:58);
        ctx.save();ctx.strokeStyle='rgba(228,219,157,.12)';for(let j=0;j<260;j++){const x=c.x+(rng()-.5)*1050,y=c.y+(rng()-.5)*800;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rng()-.5)*6,y-4-rng()*9);ctx.stroke()}ctx.restore();
      }
      if(b.id.includes('marshes'))drawMarsh(ctx,c,rng,58);
      if(b.id.includes('reef'))drawReefs(ctx,c,rng,120);
      if(b.id.includes('deep-cavern'))drawCavern(ctx,c,rng);
    });
  }

  function layoutFor(state,rng){
    const size=getSize(state.sizeId),biomes=state.biomeIds.map(getBiome),primary=biomes[0];
    const center={x:W*(.48+(rng()-.5)*.06),y:H*(.52+(rng()-.5)*.06)};
    const radius=Math.min(W,H)*(.35+Math.min(size.buildingCount,700)/700*.22);
    const roads=[];
    for(let i=0;i<size.roadRays;i++){
      const angle=(i/size.roadRays)*Math.PI*2+(rng()-.5)*.2;
      const end={x:center.x+Math.cos(angle)*(radius*1.55+120+rng()*150),y:center.y+Math.sin(angle)*(radius*1.25+100+rng()*120)};
      const ctrl={x:U.lerp(center.x,end.x,.52)+(rng()-.5)*90,y:U.lerp(center.y,end.y,.52)+(rng()-.5)*90};
      roads.push({id:`road-${i+1}`,kind:'radial',points:[center,ctrl,end],width:primary.medium==='underwater'?11:primary.medium==='canopy'?9:15});
    }
    for(let r=0;r<size.rings;r++){
      const rr=radius*(.43+r*.32);const pts=[];for(let i=0;i<34;i++){const a=i/33*Math.PI*2;pts.push({x:center.x+Math.cos(a)*rr*(1+(rng()-.5)*.08),y:center.y+Math.sin(a)*rr*.78*(1+(rng()-.5)*.08)})}roads.push({id:`ring-${r+1}`,kind:'ring',points:pts,width:12});
    }
    const localCount=Math.min(18,Math.max(4,Math.floor(size.buildingCount/35)));
    for(let i=0;i<localCount;i++){
      const a=(i/localCount)*Math.PI*2+(rng()-.5)*.55,inner=radius*(.18+rng()*.36),outer=inner+70+rng()*150;
      const start={x:center.x+Math.cos(a)*inner,y:center.y+Math.sin(a)*inner*.78};
      const end={x:center.x+Math.cos(a+(rng()-.5)*.65)*outer,y:center.y+Math.sin(a+(rng()-.5)*.65)*outer*.78};
      const ctrl={x:(start.x+end.x)/2+(rng()-.5)*80,y:(start.y+end.y)/2+(rng()-.5)*70};
      roads.push({id:`local-${i+1}`,kind:'local',points:[start,ctrl,end],width:7+rng()*4});
    }
    const buildings=[];
    const buildingRoads=roads.filter(r=>r.kind!=='radial'||roads.length<8);
    for(let i=0;i<size.buildingCount;i++){
      const road=buildingRoads[i%buildingRoads.length],t=.06+(((i/buildingRoads.length)%1)*.88+(rng()-.5)*.13);const p=U.bezierPoint(road.points,U.clamp(t,0.04,.96));
      const next=U.bezierPoint(road.points,U.clamp(t+.01,0.05,.96)),angle=Math.atan2(next.y-p.y,next.x-p.x),side=i%2?1:-1,off=22+rng()*55;
      let x=p.x-Math.sin(angle)*off*side+(rng()-.5)*15,y=p.y+Math.cos(angle)*off*side+(rng()-.5)*15;
      if(primary.medium==='surface-water'){x=center.x+(rng()-.5)*radius*2.1;y=center.y+(rng()-.5)*radius*1.55}
      buildings.push({id:`building-${i+1}`,x:U.clamp(x,35,W-35),y:U.clamp(y,35,H-35),angle:angle+(rng()-.5)*.25,w:8+rng()*15,h:7+rng()*12,public:i<Math.min(16,Math.ceil(size.buildingCount*.18)),district:i%Math.max(3,size.rings*2+3)});
    }
    return{center,radius,roads,buildings,biomes,size};
  }

  function roadStyle(primary){
    if(primary.medium==='underwater')return{outer:'rgba(102,188,192,.36)',inner:'rgba(211,236,221,.45)'};
    if(primary.medium==='surface-water')return{outer:'rgba(98,69,46,.5)',inner:'rgba(188,145,88,.66)'};
    if(primary.medium==='canopy')return{outer:'rgba(66,43,27,.62)',inner:'rgba(164,120,71,.7)'};
    if(primary.medium==='wetland')return{outer:'rgba(67,48,34,.58)',inner:'rgba(151,117,76,.66)'};
    if(primary.medium==='subterranean')return{outer:'rgba(20,24,26,.8)',inner:'rgba(122,106,85,.58)'};
    return{outer:'rgba(89,73,55,.35)',inner:'rgba(202,181,139,.58)'};
  }

  function drawRoads(ctx,layout){
    const style=roadStyle(layout.biomes[0]);ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
    layout.roads.forEach(r=>{curvedPath(ctx,r.points);ctx.strokeStyle=style.outer;ctx.lineWidth=r.width+8;ctx.stroke();curvedPath(ctx,r.points);ctx.strokeStyle=style.inner;ctx.lineWidth=r.width;ctx.stroke();curvedPath(ctx,r.points);ctx.strokeStyle='rgba(248,232,194,.12)';ctx.lineWidth=1.5;ctx.stroke()});ctx.restore();
  }

  function drawDistricts(ctx,layout,rng,enabled=true){if(!enabled)return;const n=Math.max(3,Math.min(8,layout.size.rings*2+3));ctx.save();ctx.globalCompositeOperation='soft-light';for(let i=0;i<n;i++){const a=i/n*Math.PI*2,dist=layout.radius*(.22+rng()*.6),x=layout.center.x+Math.cos(a)*dist,y=layout.center.y+Math.sin(a)*dist*.72,base=layout.biomes[i%layout.biomes.length].accent;irregularBlob(ctx,x,y,120+rng()*120,80+rng()*100,rng,U.withAlpha(base,.13),null,20)}ctx.restore()}

  function drawBuilding(ctx,b,primary,era,rng){
    const roof=era.roof,wall=era.wall;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle);
    ctx.fillStyle='rgba(14,18,14,.26)';ctx.beginPath();ctx.ellipse(4,5,b.w*1.1,b.h*.86,0,0,Math.PI*2);ctx.fill();
    if(primary.medium==='underwater'||primary.medium==='surface-water'){
      ctx.fillStyle=U.withAlpha(wall,.88);ctx.beginPath();ctx.ellipse(0,0,b.w,b.h,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle=U.withAlpha(U.lighten(roof,.3),.75);ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(188,234,229,.35)';ctx.beginPath();ctx.ellipse(-b.w*.22,-b.h*.2,b.w*.32,b.h*.26,0,0,Math.PI*2);ctx.fill();
      if(primary.medium==='surface-water'){ctx.strokeStyle='rgba(96,66,42,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,Math.max(b.w,b.h)*1.15,0,Math.PI*2);ctx.stroke()}
    }else if(primary.medium==='canopy'||primary.id.includes('tree')){
      ctx.fillStyle='rgba(67,47,28,.9)';ctx.beginPath();ctx.arc(0,0,Math.max(b.w,b.h)*1.25,0,Math.PI*2);ctx.fill();ctx.fillStyle=U.withAlpha(roof,.95);ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=(i%2?b.w:b.w*1.1),x=Math.cos(a)*r,y=Math.sin(a)*b.h;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.closePath();ctx.fill();
    }else{
      ctx.fillStyle=U.withAlpha(wall,.9);U.roundRect(ctx,-b.w,-b.h,b.w*2,b.h*2,2);ctx.fill();ctx.strokeStyle='rgba(48,39,31,.5)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=U.withAlpha(roof,.96);ctx.beginPath();ctx.moveTo(-b.w-3,-b.h);ctx.lineTo(0,-b.h-5-rng()*5);ctx.lineTo(b.w+3,-b.h);ctx.lineTo(b.w+3,b.h*.15);ctx.lineTo(-b.w-3,b.h*.15);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(255,243,214,.2)';ctx.beginPath();ctx.moveTo(-b.w,-b.h+.5);ctx.lineTo(0,-b.h-4);ctx.lineTo(b.w,-b.h+.5);ctx.stroke();
    }
    if(b.public){ctx.strokeStyle='rgba(255,219,139,.75)';ctx.lineWidth=1.3;ctx.setLineDash([3,2]);ctx.beginPath();ctx.arc(0,0,Math.max(b.w,b.h)+5,0,Math.PI*2);ctx.stroke()}
    ctx.restore();
  }

  function drawBuildings(ctx,layout,era,rng){const primary=layout.biomes[0];layout.buildings.forEach(b=>drawBuilding(ctx,b,primary,era,rng))}

  function semanticName(rng,type,index){const root=U.pick(rng,nameRoots),end=U.pick(rng,nameEnds);if(type==='Residence')return `${root}${end} Home ${index+1}`;return `${root}${end} ${type}`}
  function routeLabel(primary){if(primary.medium==='underwater')return'accessible current lane';if(primary.medium==='surface-water')return'level dock and ferry path';if(primary.medium==='canopy')return'guarded canopy bridge with lift access';if(primary.medium==='wetland')return'guarded step-free boardwalk';if(primary.medium==='subterranean')return'graded cavern route with lift access';if(primary.category==='Mountains')return'gradual switchback ramp route';return'wide step-free public route'}

  function buildSemanticOverlay(state,layout,rng){
    const max=Math.min(layout.buildings.length,Math.min(24,Math.max(8,Math.round(layout.size.buildingCount*.08)))),types=C.locationTypes.slice();
    if(layout.biomes[0].medium==='surface-water'||layout.biomes[0].medium==='underwater')types.unshift(C.locationTypes.find(x=>x.type==='Harbor Office'));
    if(layout.biomes[0].medium==='canopy'||layout.biomes[0].category==='Mountains')types.unshift(C.locationTypes.find(x=>x.type==='Lift House'));
    const chosen=U.shuffle(rng,layout.buildings.filter(b=>b.public).concat(layout.buildings.filter(b=>!b.public))).slice(0,max);
    const hotspots=chosen.map((b,i)=>{const t=types[i%types.length]||types[0],publicAccess=t.public?{stairsAllowed:false,stepFree:true,routeWidthMeters:1.5,entranceWidthMeters:1.3,verticalAccess:layout.biomes[0].medium==='canopy'?'wooden or electric lift':'gradual wheelchair-safe ramp or lift'}:{stairsAllowed:null,stepFree:true};return{id:`location-${i+1}`,locationId:`location-${U.hash(`${state.seed}|${i}|${t.type}`).toString(36)}`,name:semanticName(rng,t.type,i),type:t.type,icon:t.icon,public:t.public,x:b.x,y:b.y,description:`A ${t.type.toLowerCase()} placed on the painterly map and bound to a stable 2D hotspot.`,accessibility:publicAccess,services:[],goods:[],hours:'setting-defined',biomeIds:state.biomeIds.slice(),source:'WorldBuilder painterly generator'}});
    const routes=[];const primary=layout.biomes[0];
    for(let i=0;i<hotspots.length;i++){
      const a=hotspots[i],b=hotspots[(i+1)%hotspots.length],mid={x:(a.x+b.x)/2+(rng()-.5)*90,y:(a.y+b.y)/2+(rng()-.5)*70};
      routes.push({id:`route-${i+1}`,name:`Accessible Route ${i+1}`,type:routeLabel(primary),fromLocationId:a.locationId,toLocationId:b.locationId,points:[{x:a.x,y:a.y},mid,{x:b.x,y:b.y}],accessible:true,stairs:false,widthMeters:1.5,description:'Authored 2D route used by schedule-driven gliding tokens.'});
    }
    const districtCount=Math.max(3,Math.min(8,layout.size.rings*2+3));const districts=[];
    for(let i=0;i<districtCount;i++){const a=i/districtCount*Math.PI*2,dist=layout.radius*(.25+(i%2)*.25);districts.push({id:`district-${i+1}`,name:`${U.pick(rng,nameRoots)} ${U.pick(rng,['Quarter','Ward','District','Commons','Terrace','Circle'])}`,x:layout.center.x+Math.cos(a)*dist,y:layout.center.y+Math.sin(a)*dist*.72})}
    return{hotspots,routes,districts};
  }

  function drawLabels(ctx,state,overlay,layout){if(!state.options.labels)return;ctx.save();ctx.textAlign='center';ctx.shadowColor='rgba(245,238,215,.75)';ctx.shadowBlur=4;ctx.fillStyle='rgba(44,42,33,.72)';ctx.font='600 19px Georgia,serif';ctx.fillText(state.name||'Painterly Settlement',layout.center.x,layout.center.y-20);ctx.font='italic 12px Georgia,serif';ctx.fillStyle='rgba(50,53,42,.56)';overlay.districts.forEach(d=>ctx.fillText(d.name,d.x,d.y));ctx.restore()}

  function generate(state,canvas){
    canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{alpha:false});const rng=U.rng(state.seed);const biomes=state.biomeIds.map(getBiome),centers=zoneCenters(biomes.length,rng),era=getEra(state.eraId);
    paintZoneBackground(ctx,biomes,centers,state.seed,state.options.texture);drawTerrain(ctx,biomes,centers,rng,state.seed);
    const layout=layoutFor(state,rng);drawDistricts(ctx,layout,rng,state.options.districts);if(state.options.roads)drawRoads(ctx,layout);drawBuildings(ctx,layout,era,rng);
    const overlay=buildSemanticOverlay(state,layout,rng);drawLabels(ctx,state,overlay,layout);
    return{width:W,height:H,layout:{center:layout.center,radius:layout.radius,roads:layout.roads,buildingCount:layout.buildings.length},hotspots:overlay.hotspots,routes:overlay.routes,districts:overlay.districts,biomeZones:centers.map((c,i)=>({...c,biomeId:biomes[i].id})),generatedAt:new Date().toISOString()};
  }

  function generateOverlayOnly(state){const rng=U.rng(state.seed);const layout=layoutFor(state,rng);return{...buildSemanticOverlay(state,layout,rng),layout:{center:layout.center,radius:layout.radius,roads:layout.roads,buildingCount:layout.buildings.length},biomeZones:zoneCenters(state.biomeIds.length,U.rng(state.seed+1)).map((c,i)=>({...c,biomeId:state.biomeIds[i]}))}}

  global.WFGenerator=Object.freeze({WIDTH:W,HEIGHT:H,generate,generateOverlayOnly,getBiome,getSize,getEra,paletteFor,routeLabel});
})(window);
