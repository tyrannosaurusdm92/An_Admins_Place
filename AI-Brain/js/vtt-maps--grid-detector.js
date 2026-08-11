/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(){
  'use strict';
  const U=window.PZUtils,C=window.ActiveWorkspace_CONFIG;
  const GD={};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const CANONICAL_CELL_PX=150;
  const PROFILES=Object.freeze([
    Object.freeze({id:'large-portrait-17x22-inch',label:'Large portrait grid (17 × 22 in)',width:5100,height:6600,cellPixel:150,cols:34,rows:44,file:'Grid (17x22).png'}),
    Object.freeze({id:'landscape-22x17',label:'Landscape grid (22 × 17 squares)',width:3300,height:2550,cellPixel:150,cols:22,rows:17,file:'Grid (22x17).png'}),
    Object.freeze({id:'portrait-17x22',label:'Portrait grid (17 × 22 squares)',width:2550,height:3300,cellPixel:150,cols:17,rows:22,file:'Grid (8.5x11).png'}),
    Object.freeze({id:'seamless-1x1',label:'Seamless grid tile 1 × 1',width:1200,height:1200,cellPixel:150,cols:8,rows:8,file:'Seamless Grid Pattern (1x1).png'}),
    Object.freeze({id:'seamless-2x2',label:'Seamless grid tile 2 × 2',width:2400,height:2400,cellPixel:150,cols:16,rows:16,file:'Seamless Grid Pattern (2x2).png'}),
    Object.freeze({id:'seamless-3x3',label:'Seamless grid tile 3 × 3',width:3600,height:3600,cellPixel:150,cols:24,rows:24,file:'Seamless Grid Pattern (3x3).png'})
  ]);

  function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('The uploaded map image could not be decoded.'));img.src=src})}
  function percentile(values,p){if(!values.length)return 0;const a=[...values].sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.max(0,Math.floor((a.length-1)*p)))]}
  function mean(values){return values.length?values.reduce((s,v)=>s+v,0)/values.length:0}
  function smooth(values,radius=2){return values.map((_,i)=>{let s=0,n=0;for(let j=Math.max(0,i-radius);j<=Math.min(values.length-1,i+radius);j++){s+=values[j];n++}return s/Math.max(1,n)})}
  function normalize(values,loP=.40,hiP=.985){const lo=percentile(values,loP),hi=percentile(values,hiP),range=hi-lo;if(!Number.isFinite(range)||range<1e-8)return values.map(()=>0);return values.map(v=>clamp((v-lo)/range,0,1))}
  function prominence(values,radius=4){const base=smooth(values,radius);return values.map((v,i)=>Math.abs(v-base[i]))}
  function topBlend(values){const a=[...values].sort((x,y)=>y-x);return (a[0]||0)*.68+(a[1]||0)*.20+(a[2]||0)*.12}
  function matchExactProfile(w,h){return PROFILES.find(p=>p.width===w&&p.height===h)||null}
  function canonicalResult(img,profile,method='canonical-grid-profile-v2',confidence=.995){
    return{detected:true,canonical:true,confidence,cellFeet:5,cols:profile.cols,rows:profile.rows,sourceWidth:img.naturalWidth,sourceHeight:img.naturalHeight,cellPixelWidth:profile.cellPixel,cellPixelHeight:profile.cellPixel,originX:0,originY:0,crop:{x:0,y:0,width:img.naturalWidth,height:img.naturalHeight},profileId:profile.id,profileLabel:profile.label,sourceGridFile:profile.file,method,signature:{family:'ActiveWorkspace supplied 150 px grid',cellPixel:150,transparentAware:true,fullBleed:true}};
  }

  function axisScores(data,w,h,axis){
    const len=axis==='x'?w:h,other=axis==='x'?h:w;
    const channels={alpha:new Float64Array(len),dark:new Float64Array(len),bright:new Float64Array(len),edge:new Float64Array(len),alphaEdge:new Float64Array(len),local:new Float64Array(len)};
    const stride=Math.max(1,Math.floor(other/420));
    for(let pos=0;pos<len;pos++){
      let alpha=0,dark=0,bright=0,edge=0,alphaEdge=0,local=0,n=0;
      for(let q=0;q<other;q+=stride){
        const x=axis==='x'?pos:q,y=axis==='x'?q:pos,i=(y*w+x)*4;
        const a=data[i+3]/255,l=(data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722),white=l*a+255*(1-a),black=l*a;
        const pp=Math.max(0,pos-1),np=Math.min(len-1,pos+1);
        const px=axis==='x'?pp:q,py=axis==='x'?q:pp,pi=(py*w+px)*4;
        const nx=axis==='x'?np:q,ny=axis==='x'?q:np,ni=(ny*w+nx)*4;
        const pa=data[pi+3]/255,pl=(data[pi]*.2126+data[pi+1]*.7152+data[pi+2]*.0722),pwhite=pl*pa+255*(1-pa),pblack=pl*pa;
        const na=data[ni+3]/255,nl=(data[ni]*.2126+data[ni+1]*.7152+data[ni+2]*.0722),nwhite=nl*na+255*(1-na),nblack=nl*na;
        alpha+=a;
        dark+=(255-white)/255;
        bright+=black/255;
        edge+=(Math.abs(white-pwhite)+Math.abs(black-pblack))/510;
        alphaEdge+=Math.abs(a-pa);
        local+=(Math.abs(white-(pwhite+nwhite)/2)+Math.abs(black-(pblack+nblack)/2))/510;
        n++;
      }
      channels.alpha[pos]=alpha/Math.max(1,n);
      channels.dark[pos]=dark/Math.max(1,n);
      channels.bright[pos]=bright/Math.max(1,n);
      channels.edge[pos]=edge/Math.max(1,n);
      channels.alphaEdge[pos]=alphaEdge/Math.max(1,n);
      channels.local[pos]=local/Math.max(1,n);
    }
    const normalized={
      alpha:normalize([...channels.alpha]),
      alphaProm:normalize(prominence([...channels.alpha],3)),
      darkProm:normalize(prominence([...channels.dark],5)),
      brightProm:normalize(prominence([...channels.bright],5)),
      edge:normalize([...channels.edge],.45,.98),
      alphaEdge:normalize([...channels.alphaEdge],.45,.98),
      local:normalize([...channels.local],.45,.98)
    };
    const combined=[];
    for(let i=0;i<len;i++)combined.push(topBlend([normalized.alpha[i],normalized.alphaProm[i],normalized.darkProm[i],normalized.brightProm[i],normalized.edge[i],normalized.alphaEdge[i],normalized.local[i]]));
    return{scores:smooth(combined,1),channels,normalized,transparency:1-mean([...channels.alpha])};
  }

  function autocorrelation(scores,lag){
    const n=scores.length-lag;if(n<4)return 0;
    let ma=0,mb=0;for(let i=0;i<n;i++){ma+=scores[i];mb+=scores[i+lag]}ma/=n;mb/=n;
    let sum=0,a2=0,b2=0;for(let i=0;i<n;i++){const a=scores[i]-ma,b=scores[i+lag]-mb;sum+=a*b;a2+=a*a;b2+=b*b}
    return sum/Math.sqrt(Math.max(1e-12,a2*b2));
  }
  function peakCenters(scores){
    const high=Math.max(percentile(scores,.84),mean(scores)+.05),peaks=[];let start=-1;
    for(let i=0;i<=scores.length;i++){
      const on=i<scores.length&&scores[i]>=high;
      if(on&&start<0)start=i;
      if((!on||i===scores.length)&&start>=0){let best=start;for(let j=start+1;j<i;j++)if(scores[j]>scores[best])best=j;peaks.push(best);start=-1}
    }
    return peaks;
  }
  function phaseForLag(scores,lag){
    let bestOffset=0,best=-Infinity,bestSupport=0;
    const avg=mean(scores),tol=Math.max(1,Math.min(3,Math.round(lag*.07)));
    for(let off=0;off<lag;off++){
      let s=0,n=0,hits=0;
      for(let p=off;p<scores.length;p+=lag){let v=0;for(let d=-tol;d<=tol;d++){const q=p+d;if(q>=0&&q<scores.length)v=Math.max(v,scores[q]||0)}s+=v;n++;if(v>=.50)hits++}
      const value=s/Math.max(1,n),support=hits/Math.max(1,n),objective=value*.72+support*.28;
      if(objective>best){best=objective;bestOffset=off;bestSupport=support}
    }
    const contrast=clamp((best-avg)/Math.max(.08,1-avg),0,1);
    return{offset:bestOffset,value:best,contrast,support:bestSupport};
  }
  function latticePeakSupport(peaks,lag,offset,tolerance,scoresLength){
    if(!peaks.length)return 0;let hit=0;
    peaks.forEach(p=>{const r=((p-offset)%lag+lag)%lag,d=Math.min(r,lag-r);if(d<=tolerance)hit++});
    const expected=Math.max(1,Math.round(scoresLength/lag));
    return clamp((hit/Math.max(1,Math.min(peaks.length,expected)))*.85+(hit/Math.max(1,peaks.length))*.15,0,1);
  }
  function scoreLag(scores,peaks,lag,maxSpacing){
    const corr=clamp((autocorrelation(scores,lag)+1)/2,0,1),phase=phaseForLag(scores,lag),tol=Math.max(1,Math.min(3,Math.round(lag*.08)));
    const peakSupport=latticePeakSupport(peaks,lag,phase.offset,tol,scores.length);
    const sizePenalty=(lag/maxSpacing)*.018;
    return{lag,offset:phase.offset,corr,phase:phase.value,phaseContrast:phase.contrast,support:Math.max(phase.support,peakSupport),score:corr*.43+phase.contrast*.27+Math.max(phase.support,peakSupport)*.30-sizePenalty};
  }
  function detectAxis(axis,minSpacing,maxSpacing){
    const scores=axis.scores,min=Math.max(6,Math.floor(minSpacing)),max=Math.min(Math.floor(scores.length/2.25),Math.floor(maxSpacing));if(max<=min)return null;
    const peaks=peakCenters(scores),candidates=[];
    for(let lag=min;lag<=max;lag++)candidates.push(scoreLag(scores,peaks,lag,max));
    candidates.sort((a,b)=>b.score-a.score);let best=candidates[0];if(!best)return null;
    for(let div=4;div>=2;div--){const target=best.lag/div;if(target<min)continue;const nearby=candidates.filter(c=>Math.abs(c.lag-target)<=2).sort((a,b)=>b.score-a.score)[0];if(nearby&&nearby.score>=best.score*.82&&nearby.support>=best.support*.78)best=nearby}
    const near=candidates.filter(c=>Math.abs(c.lag-best.lag)<=2).sort((a,b)=>b.score-a.score)[0];if(near)best=near;
    let first=best.offset;if(first<=best.lag*.28||first>=best.lag*.72)first=0;
    let cells=Math.max(1,Math.round((scores.length-first)/best.lag)),end=first+cells*best.lag;
    if(end>scores.length+best.lag*.30){cells--;end=first+cells*best.lag}
    if(Math.abs(end-scores.length)<=best.lag*.30)end=scores.length;
    const coverage=clamp(cells/8,0,1),squareLineStrength=clamp(best.phase,0,1),confidence=clamp(best.score*.62+best.support*.20+squareLineStrength*.10+coverage*.08,0,1);
    return{spacing:best.lag,offset:first,end,cells,confidence,peaks:peaks.slice(0,500),score:best.score,correlation:best.corr,support:best.support,transparency:axis.transparency};
  }

  function detectPixels(data,w,h,sourceWidth,sourceHeight,options={}){
    const exact=matchExactProfile(sourceWidth,sourceHeight);
    if(exact&&!options.forceScan)return canonicalResult({naturalWidth:sourceWidth,naturalHeight:sourceHeight},exact);
    const scaleX=w/sourceWidth,scaleY=h/sourceHeight;
    const minSpacing=Math.max(6,U.num(options.minSpacing,C.defaults.gridDetectionMinSpacing)*Math.min(scaleX,scaleY)),maxSpacing=Math.max(minSpacing+3,U.num(options.maxSpacing,C.defaults.gridDetectionMaxSpacing)*Math.max(scaleX,scaleY)),xs=axisScores(data,w,h,'x'),ys=axisScores(data,w,h,'y'),dx=detectAxis(xs,minSpacing,maxSpacing),dy=detectAxis(ys,minSpacing,maxSpacing);
    if(!dx||!dy)throw new Error('A repeating square grid could not be detected. Use manual calibration.');
    const sx=sourceWidth/w,sy=sourceHeight/h,rawCellX=dx.spacing*sx,rawCellY=dy.spacing*sy;
    const dimensionFamily=sourceWidth%CANONICAL_CELL_PX===0&&sourceHeight%CANONICAL_CELL_PX===0&&sourceWidth/CANONICAL_CELL_PX<=300&&sourceHeight/CANONICAL_CELL_PX<=300;
    const closeToCanonical=Math.abs(rawCellX-CANONICAL_CELL_PX)<=CANONICAL_CELL_PX*.12&&Math.abs(rawCellY-CANONICAL_CELL_PX)<=CANONICAL_CELL_PX*.12;
    if(dimensionFamily&&closeToCanonical){
      const profile={id:'canonical-150px-family',label:'Supplied seamless 150 px grid family',file:'custom tiled/cropped map',cellPixel:150,cols:Math.round(sourceWidth/150),rows:Math.round(sourceHeight/150)};
      return canonicalResult({naturalWidth:sourceWidth,naturalHeight:sourceHeight},profile,'canonical-150px-family-scan-v2',clamp((dx.confidence+dy.confidence)/2*.45+.53,0,1));
    }
    const squareRatio=Math.min(rawCellX,rawCellY)/Math.max(rawCellX,rawCellY),confidence=clamp((dx.confidence+dy.confidence)/2*.72+squareRatio*.20+Math.min(xs.transparency+ys.transparency,.5)*.16,0,1),originX=dx.offset*sx,originY=dy.offset*sy;
    const cols=Math.max(1,dx.cells),rows=Math.max(1,dy.cells),cropWidth=Math.min(sourceWidth-originX,(dx.end-dx.offset)*sx),cropHeight=Math.min(sourceHeight-originY,(dy.end-dy.offset)*sy);
    return{detected:confidence>=U.num(options.minConfidence,C.defaults.gridDetectionConfidence),canonical:false,confidence,cellFeet:5,cols,rows,sourceWidth,sourceHeight,cellPixelWidth:rawCellX,cellPixelHeight:rawCellY,originX,originY,crop:{x:Math.max(0,originX),y:Math.max(0,originY),width:Math.max(1,cropWidth),height:Math.max(1,cropHeight)},profileId:'periodic-grid',profileLabel:'Scanned repeating square grid',axis:{x:dx,y:dy},method:'alpha-luminance-periodic-line-scan-v2',signature:{family:'ActiveWorkspace supplied grid compatible',transparentAware:true,squareRatio}};
  }
  GD.detectPixels=(data,width,height,sourceWidth=width,sourceHeight=height,options={})=>detectPixels(data,width,height,sourceWidth,sourceHeight,options);
  GD.detectImage=async(src,options={})=>{
    const img=await loadImage(src),exact=matchExactProfile(img.naturalWidth,img.naturalHeight);
    if(exact&&!options.forceScan)return canonicalResult(img,exact);
    const maxDim=U.int(options.maxDimension,1600),scale=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(32,Math.round(img.naturalWidth*scale)),h=Math.max(32,Math.round(img.naturalHeight*scale)),canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(ctx.clearRect)ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h).data;
    return detectPixels(pixels,w,h,img.naturalWidth,img.naturalHeight,options);
  };
  GD.manual=(sourceWidth,sourceHeight,{cols,rows,originX=0,originY=0,endX=sourceWidth,endY=sourceHeight}={})=>{cols=clamp(U.int(cols,30),1,300);rows=clamp(U.int(rows,20),1,300);originX=clamp(U.num(originX),0,sourceWidth-1);originY=clamp(U.num(originY),0,sourceHeight-1);endX=clamp(U.num(endX,sourceWidth),originX+1,sourceWidth);endY=clamp(U.num(endY,sourceHeight),originY+1,sourceHeight);return{detected:false,manual:true,confidence:1,cellFeet:5,cols,rows,sourceWidth,sourceHeight,cellPixelWidth:(endX-originX)/cols,cellPixelHeight:(endY-originY)/rows,originX,originY,crop:{x:originX,y:originY,width:endX-originX,height:endY-originY},profileId:'manual',profileLabel:'Manual five-foot calibration',method:'manual-calibration-v2'}};
  GD.CANONICAL_PROFILES=PROFILES;
  window.ActiveWorkspaceGridDetector=Object.freeze(GD);
})();
