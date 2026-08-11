export function buildSupportPlan({goal,barriers=[],supports=[],energy="medium"}={}){
  const smallest = energy==="low" ? "Choose a version that takes about two minutes or less." : "Choose the smallest action that creates visible progress.";
  return {goal:String(goal||"stabilize and identify the next useful step"),barriers,supports,steps:[smallest,"Decide what cue will start the action.","Decide what makes stopping or resting allowed.","Identify who or what can help if the step becomes inaccessible.","Review what happened without grading yourself as a person."],review:"Keep what helped; change the environment, cue, size, or support for what did not."};
}
