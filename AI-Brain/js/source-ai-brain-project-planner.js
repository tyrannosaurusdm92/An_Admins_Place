import { routeIntent } from "./ai-brain-router.js";
export async function planProject(request,{constraints=[],deliverables=[]}={}){
  const route=await routeIntent(request);
  const phases=["understand","inventory","design","build","validate","document","iterate"];
  return {request,capabilities:route.capabilities,tags:route.tags,constraints,deliverables,phases,
    checks:["preserve user constraints","identify dependencies","avoid silent data loss","test critical paths","record provenance","surface uncertainty"]};
}
