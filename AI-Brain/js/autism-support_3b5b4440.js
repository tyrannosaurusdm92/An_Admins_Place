export function autismSupportOptions({sensory=false,change=false,communication=false,burnout=false}={}) {
  const options=[];
  if(sensory) options.push("Identify which sensory channels are too intense or too low; change one input at a time if possible.");
  if(change) options.push("Make the change explicit: what is staying the same, what is changing, when, who is involved, and what the fallback is.");
  if(communication) options.push("Offer written, literal, asynchronous, yes/no, or scripted communication instead of assuming spontaneous speech is easiest.");
  if(burnout) options.push("Reduce demands, masking, and nonessential transitions; prioritize basic needs and recovery rather than productivity coaching.");
  if(!options.length) options.push("Ask what support would make the environment or communication more predictable and tolerable before trying to change the person.");
  return options;
}
