(function(root){
  "use strict";
  const RX={
    suicide:/\b(kill myself|end my life|suicide|suicidal|want to die|can't stay safe|cannot stay safe|attempted suicide)\b/i,
    violence:/\b(kill (him|her|them|someone)|hurt (him|her|them|someone)|murder|shoot|stab)\b/i,
    overdose:/\b(overdose|poisoned|poisoning|took too many|dangerous ingestion)\b/i,
    medical:/\b(can't breathe|cannot breathe|severe trouble breathing|unconscious|passed out and won't wake|seizure|stroke|face droop|one-sided weakness|anaphylaxis|severe allergic reaction|crushing chest|severe chest pressure|uncontrolled bleeding)\b/i,
    psychosis:/\b(hearing voices|seeing things|hallucination|paranoia|paranoid|being watched|being followed|thought broadcasting|command voice)\b/i,
    mania:/\b(no sleep for days|haven't slept for days|have not slept for days|invincible|limitless energy|racing thoughts|grandiose)\b/i,
    medication:/\b(stop my medication|stop my meds|change my dose|increase my dose|decrease my dose|taper|missed dose|side effect|withdrawal)\b/i
  };
  function classify(text){
    text=String(text||"");
    const flags=Object.fromEntries(Object.entries(RX).map(([k,r])=>[k,r.test(text)]));
    let level="routine", route="support_and_skills";
    if(flags.suicide||flags.violence||flags.overdose||flags.medical){level="immediate";route="deterministic_emergency_route";}
    else if(flags.psychosis||flags.mania){level="urgent";route="reality_grounded_professional_bridge";}
    else if(flags.medication){level="watch";route="medication_boundary";}
    return {schema:"psychiatrypt3.safety.v1",level,route,flags};
  }
  function immediateMessage(country){
    const base="This may be an immediate safety or medical emergency. Contact local emergency services now, involve a nearby trusted person if possible, and follow any existing safety or emergency plan. Do not delay emergency help to continue a chatbot exercise.";
    return String(country||"").toUpperCase()==="US" ? base+" If the crisis is suicidal or emotional and emergency medical response is not required, 988 is an additional U.S. crisis option." : base;
  }
  root.PsychiatryPT3Safety={classify,immediateMessage};
})(typeof globalThis!=="undefined"?globalThis:this);
