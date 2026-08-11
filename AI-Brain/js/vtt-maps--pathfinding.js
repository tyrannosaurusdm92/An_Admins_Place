/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(){
  'use strict';
  const U=window.PZUtils,PF={};
  const key=(x,y)=>`${x},${y}`,dirs4=[[1,0],[-1,0],[0,1],[0,-1]],dirs8=[...dirs4,[1,1],[1,-1],[-1,1],[-1,-1]];
  function terrainType(cell){return typeof cell==='string'?cell:cell?.type}
  function terrainCost(cell,options={}){const t=terrainType(cell);if(t==='wall'||t==='blocked')return Infinity;if(t==='difficult'||t==='water')return 2;if(t==='hazard')return options.avoidHazards===false?1:2.5;return 1}
  PF.key=key;
  PF.footprint=(position,size=1)=>{const out=[];size=Math.max(1,U.int(size,1));for(let dx=0;dx<size;dx++)for(let dy=0;dy<size;dy++)out.push({x:U.int(position.x)+dx,y:U.int(position.y)+dy});return out};
  PF.occupiedFromTokens=(tokens=[],exceptId='')=>{const set=new Set();tokens.filter(t=>t.id!==exceptId&&U.num(t.hp,1)>0&&t.visible!==false).forEach(t=>PF.footprint(t,t.size||1).forEach(c=>set.add(key(c.x,c.y))));return set};
  PF.canOccupy=(grid,position,size=1,options={})=>{const cols=U.int(grid.cols,30),rows=U.int(grid.rows,20),terrain=grid.terrain||{},occupied=options.occupied instanceof Set?options.occupied:new Set(options.occupied||[]);return PF.footprint(position,size).every(c=>c.x>=0&&c.y>=0&&c.x<cols&&c.y<rows&&!occupied.has(key(c.x,c.y))&&Number.isFinite(terrainCost(terrain[key(c.x,c.y)],options)))};
  PF.findPath=(grid,start,goal,options={})=>{
    const cols=U.int(grid.cols,30),rows=U.int(grid.rows,20),terrain=grid.terrain||{},occupied=options.occupied instanceof Set?options.occupied:new Set(options.occupied||[]),allowDiagonal=options.diagonal!==false,size=Math.max(1,U.int(options.tokenSize||start.size||1,1)),dirs=allowDiagonal?dirs8:dirs4;
    if(!PF.canOccupy(grid,goal,size,{...options,occupied}))return[];
    const open=[{x:U.int(start.x),y:U.int(start.y),g:0,f:0}],came=new Map(),cost=new Map([[key(start.x,start.y),0]]),h=(x,y)=>allowDiagonal?Math.max(Math.abs(goal.x-x),Math.abs(goal.y-y)):Math.abs(goal.x-x)+Math.abs(goal.y-y);
    while(open.length){open.sort((a,b)=>a.f-b.f||a.g-b.g);const cur=open.shift(),ck=key(cur.x,cur.y);if(cur.x===goal.x&&cur.y===goal.y){const out=[];let node={x:cur.x,y:cur.y};while(node){out.push(node);node=came.get(key(node.x,node.y))||null}return out.reverse()}
      for(const[dX,dY]of dirs){const x=cur.x+dX,y=cur.y+dY,nk=key(x,y),diagonal=dX!==0&&dY!==0;if(x<0||y<0||x+size>cols||y+size>rows)continue;if(diagonal&&options.cornerCutting!==true){const a={x:cur.x+dX,y:cur.y},b={x:cur.x,y:cur.y+dY};if(!PF.canOccupy(grid,a,size,{...options,occupied})||!PF.canOccupy(grid,b,size,{...options,occupied}))continue}if(!PF.canOccupy(grid,{x,y},size,{...options,occupied}))continue;
        let cellCost=1;for(const c of PF.footprint({x,y},size))cellCost=Math.max(cellCost,terrainCost(terrain[key(c.x,c.y)],options));const step=(diagonal?1.41421356237:1)*cellCost,newG=cur.g+step;if(newG<(cost.get(nk)??Infinity)){cost.set(nk,newG);came.set(nk,{x:cur.x,y:cur.y});open.push({x,y,g:newG,f:newG+h(x,y)})}}
    }return[];
  };
  PF.pathFeet=(path,cellFeet=5,rule='five-ten-five')=>{let orth=0,diag=0;for(let i=1;i<(path||[]).length;i++){const a=path[i-1],b=path[i];if(a.x!==b.x&&a.y!==b.y)diag++;else orth++}if(rule==='five-ten-five')return orth*cellFeet+Math.floor(diag/2)*cellFeet*3+(diag%2)*cellFeet;return Math.round((orth+diag)*cellFeet)};
  PF.distanceCells=(a,b,diagonal=true)=>{
    const as=Math.max(1,U.int(a?.size,1)),bs=Math.max(1,U.int(b?.size,1)),ax=U.int(a?.x),ay=U.int(a?.y),bx=U.int(b?.x),by=U.int(b?.y);
    const dx=Math.max(0,bx-(ax+as-1),ax-(bx+bs-1)),dy=Math.max(0,by-(ay+as-1),ay-(by+bs-1));
    return diagonal?Math.max(dx,dy):dx+dy;
  };
  PF.distanceFeet=(a,b,cellFeet=5)=>PF.distanceCells(a,b,true)*cellFeet;
  PF.center=token=>({x:Math.round(U.num(token?.x)+(Math.max(1,U.int(token?.size,1))-1)/2),y:Math.round(U.num(token?.y)+(Math.max(1,U.int(token?.size,1))-1)/2)});
  PF.line=(a,b)=>{const points=[];let x0=U.int(a.x),y0=U.int(a.y),x1=U.int(b.x),y1=U.int(b.y),dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;while(true){points.push({x:x0,y:y0});if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx}if(e2<=dx){err+=dx;y0+=sy}}return points};
  PF.hasLineOfSight=(grid,a,b)=>!PF.line(PF.center(a),PF.center(b)).slice(1,-1).some(p=>['wall','blocked'].includes(terrainType(grid.terrain?.[key(p.x,p.y)])));
  window.ActiveWorkspacePathfinding=Object.freeze(PF);
})();
