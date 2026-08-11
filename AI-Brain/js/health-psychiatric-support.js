export const MEDICATION_BOUNDARIES = [
  "Do not start, stop, increase, decrease, split, combine, or taper a prescription based only on AI advice.",
  "For missed doses, interactions, pregnancy concerns, severe side effects, overdose, or withdrawal risk, contact a prescriber, pharmacist, poison service, urgent care, or emergency service as appropriate.",
  "The assistant may help organize medication names, schedules, observed effects, questions, and clinician instructions without changing them."
];

export function psychiatricCheckIn({sleep,mood,anxiety,energy,psychosisLike,medicationConcern}={}) {
  return {
    observations:{sleep,mood,anxiety,energy,psychosisLike:Boolean(psychosisLike),medicationConcern:Boolean(medicationConcern)},
    nextQuestions:[
      "What changed from your usual baseline, and when?",
      "How is this affecting sleep, eating, self-care, relationships, work/school, or safety?",
      "Are there thoughts of self-harm, suicide, or harming someone else?",
      "Any new medication, dose change, substance use, missed doses, or abrupt stopping?",
      "Would you like help preparing a concise message for your clinician?"
    ]
  };
}
