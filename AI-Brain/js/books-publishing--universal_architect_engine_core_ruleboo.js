/* AI-Brain generic capability extraction. Source group: system-architect. Original UI shell omitted; embedded logic retained. */

const q=document.getElementById('search');q.addEventListener('input',()=>{const term=q.value.trim().toLowerCase();document.querySelectorAll('.chapter section,.class-entry,details.entry').forEach(el=>{el.classList.toggle('hidden-search',term && !el.innerText.toLowerCase().includes(term));});});
document.getElementById('expand').addEventListener('click',()=>document.querySelectorAll('details').forEach(d=>d.open=true));document.getElementById('collapse').addEventListener('click',()=>document.querySelectorAll('details').forEach(d=>d.open=false));

(function(){
  const run=document.getElementById('axis-calc-run');
  if(!run)return;
  const phases=[
    [0,187,'Foundation / Dormant'],[188,374,'Foundation / Familiar'],[375,561,'Foundation / Half-Source'],[562,749,'Foundation / Established Foundation'],
    [750,937,'Developing / Initiate'],[938,1124,'Developing / Practiced'],[1125,1311,'Developing / Cross-Trained'],[1312,1499,'Developing / Near Specialist'],
    [1500,1687,'Advanced / Specialist'],[1688,1874,'Advanced / Deep Specialist'],[1875,2061,'Advanced / Expert'],[2062,2249,'Advanced / High Expert'],
    [2250,2437,'Defining / Master'],[2438,2625,'Defining / Rooted Master'],[2626,2812,'Defining / Grandmaster'],[2813,3000,'Defining / Absolute Expression']
  ];
  const phase=v=>(phases.find(x=>v>=x[0]&&v<=x[1])||phases[0])[2];
  const family=(s,p)=> s>=375&&p>=375?'Hybrid Psi-Caster':s>=1500?'Full-Caster':s>=375?'Half-Caster':p>=1500?'Full Psi':p>=375?'Half-Psi':'Melee / Non-Caster';
  const gear=m=>m<188?'Unarmored; simple weapons; no shield':m<375?'Light armor; simple + one signature group':m<562?'Light armor; one martial group; shields':m<750?'Light/medium armor; two martial groups; shields':m<938?'Light/medium; all class-listed weapons':m<1125?'Light/medium; all simple and martial weapons':m<1312?'All armor; all simple and martial weapons':`All armor and weapons; ${m<1500?1:m<1688?2:m<2062?3:m<2438?4:5} martial mastery slot(s)`;
  function update(){
    const m=Math.max(0,Math.min(3000,Number(document.getElementById('axis-martial').value)||0));
    const s=Math.max(0,Math.min(3000,Number(document.getElementById('axis-spell').value)||0));
    const p=Math.max(0,Math.min(3000,Number(document.getElementById('axis-psi').value)||0));
    document.getElementById('axis-calc-output').innerHTML=`<strong>Candidate family:</strong> ${family(s,p)}<br><strong>Martial:</strong> ${phase(m)}<br><strong>Spellcraft:</strong> ${phase(s)}<br><strong>Psionics:</strong> ${phase(p)}<br><strong>Training:</strong> ${gear(m)}`;
  }
  run.addEventListener('click',update);update();
})();
