import { retrieveKnowledge } from "./ai-brain-retrieval.js";
import { routeIntent } from "./ai-brain-router.js";
import { safetyRoute } from "./ai-brain-safety.js";
export async function buildProviderContext(userText,{memory=null,project=null,maxRecords=20}={}){
  const [route,knowledge]=await Promise.all([routeIntent(userText),retrieveKnowledge(userText,{recordLimit:maxRecords})]);
  return {userText,route,safety:safetyRoute(userText),memory,project,knowledge:knowledge.map(x=>({score:x.score,source:x.shard,record:x.record}))};
}
export function toGeminiContents(ctx){return [{role:"user",parts:[{text:`Use the attached AI-Brain context as retrieval material. Preserve source uncertainty and safety boundaries.\n\n${JSON.stringify(ctx)}`}]}];}
