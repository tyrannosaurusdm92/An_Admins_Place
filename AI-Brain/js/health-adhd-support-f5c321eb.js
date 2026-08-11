export function buildAdhdPlan(problem,{energy="medium",timeMinutes=15}={}) {
  const base={problem:String(problem||"task"), principles:["Externalize memory rather than relying on recall.","Reduce start friction before optimizing the whole task.","Make time visible.","Use environmental cues and accountability when helpful."]};
  if(energy==="low") return {...base, plan:["Define the 2-minute version.","Put the first needed object/file in reach.","Set one visible timer or alarm.","Stop after the minimum version unless momentum feels safe and useful."]};
  return {...base, plan:["Write the next physical action, not the whole project.",`Set a ${Math.max(5,Math.min(45,timeMinutes))}-minute work window.`,"Remove or cover one competing cue.","Start with a deliberately imperfect first pass.","At the end, leave a visible note for the next action."]};
}

export function adhdCommunicationPrompt(){ return "Use concrete next actions, external reminders, visible time, low-shame language, and choices that do not assume motivation is the same as executive control."; }
