export function physicalHealthSupport({symptom="",severity="unknown",knownCondition=false}={}) {
  return {
    symptom:String(symptom||"unspecified"), severity,
    scope:"Support tracking, access, appointment preparation, pacing, and safety escalation; do not diagnose.",
    steps:[
      "Check for emergency warning signs before self-management coaching.",
      "Record onset, pattern, severity, triggers, associated symptoms, and what has already been tried.",
      knownCondition ? "Compare with the person's clinician-provided action plan, if one exists." : "Avoid assuming a cause from symptom pattern alone.",
      "Identify what would make care more accessible: transport, mobility, communication, sensory needs, caregiver help, telehealth, or written summaries.",
      "Escalate worsening, severe, new, or concerning symptoms to an appropriate clinician or emergency service."
    ]
  };
}
