export const adhdTools={
 tinyStart(task){return {task,step:`Do the smallest visible first action for ${task} for 2 minutes.`,stopPermission:true};},
 externalize(items=[]){return {visible_now:items.slice(0,3),later:items.slice(3),rule:'Keep the active list short and visible.'};},
 transition(next){return [`Name the current stopping point.`,`Set a visible cue for ${next}.`,`Do one bridge action only.`];}
};
