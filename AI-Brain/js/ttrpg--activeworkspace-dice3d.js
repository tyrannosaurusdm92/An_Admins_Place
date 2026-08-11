/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(){
  'use strict';
  let box=null,rolling=false,queue=[];
  function container(){return document.getElementById('dice3dTable')}
  function init(){const el=container();if(box||!el||!window.DICE||el.clientWidth<40||el.clientHeight<40)return !!box;try{box=new DICE.dice_box(el);box.setDice('1d20');window.addEventListener('resize',()=>{try{box?.reinit?.(el)}catch(_){}});return true}catch(err){console.warn('3D dice renderer unavailable',err);return false}}
  function visualData(roll){const notation=[],requested=[];for(const t of roll?.terms||[]){if(t.kind!=='dice'||![4,6,8,10,12,20].includes(Number(t.sides)))continue;notation.push(`${t.count}d${t.sides}`);requested.push(...t.values.map(Number))}return{notation:notation.join('+')||'1d20',requested}}
  function run(){if(rolling||!queue.length)return;const item=queue.shift();if(!init()){setTimeout(()=>queue.unshift(item),150);return}const {notation,requested}=visualData(item.roll);try{box.setDice(notation);rolling=true;box.start_throw(()=>requested,()=>{rolling=false;item.resolve?.();setTimeout(run,80)})}catch(err){rolling=false;console.warn(err);item.resolve?.();run()}}
  function visualize(roll){return new Promise(resolve=>{queue.push({roll,resolve});run()})}
  window.ActiveWorkspaceDice3D=Object.freeze({init,visualize});
})();
