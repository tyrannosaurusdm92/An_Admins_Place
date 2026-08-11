export function buildClinicianHandoff(data={}){
  const lines=[];
  const add=(label,v)=>{if(v!==undefined&&v!==null&&String(v).trim()!=="") lines.push(`${label}: ${Array.isArray(v)?v.join(", "):v}`)};
  add("Main concern",data.mainConcern); add("When it started / changed",data.onset); add("Current impact",data.impact); add("Safety concerns",data.safety); add("Medications/substances changed",data.medicationChanges); add("Physical symptoms",data.physicalSymptoms); add("What has helped",data.helped); add("What has made it worse",data.worse); add("Accessibility needs",data.accessibility); add("Questions for clinician",data.questions);
  return {title:"User-reviewed care summary", text:lines.join("\n"), disclaimer:"This summary organizes the user's report; it does not provide a diagnosis or replace clinical assessment."};
}
