(function(root){
  "use strict";
  function findSkill(cards,id){return (cards&&cards.skills||[]).find(s=>s.id===id)||null;}
  function coach(skill,mode){
    if(!skill) return null;
    const max=mode==="overwhelm"?3:skill.steps.length;
    return {title:skill.title,domain:skill.domain,steps:skill.steps.slice(0,max),avoid:skill.avoid||[],adaptations:skill.adaptations||[]};
  }
  root.PsychiatryPT3SkillCoach={findSkill,coach};
})(typeof globalThis!=="undefined"?globalThis:this);
