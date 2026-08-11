/* AI-Brain generic capability extraction. Source group: voice-persona-creator. Original UI shell omitted; embedded logic retained. */

  const buttons=[...document.querySelectorAll('[data-tab]')];
  function show(tab){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view_'+tab).classList.add('active');
    buttons.forEach(b=>b.classList.toggle('secondary',b.dataset.tab!==tab));
  }
  buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.tab)));
