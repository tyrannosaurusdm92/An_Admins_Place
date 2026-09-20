/* Jasper Fanfiction — character/story prompt helper with William-style reference + private-handoff boundary. */
(function(global){'use strict';
function isPrivate(context={},explicitMode=false){
  const target=String(context?.choice?.target||context?.selected_choice?.target||'');
  return Boolean(explicitMode)||target.startsWith('@generate-explicit');
}
function referenceOptions(context={},series={},request=''){
  const character=String(series?.pairing||context?.series?.pairing||context?.character?.name||'');
  return {
    query:[request,context?.choice?.generation_hint,context?.choice?.description,context?.parent?.title,series?.title].filter(Boolean).join(' '),
    sceneGoal:request,
    theme:series?.theme||'',
    dynamic:series?.relationship_dynamic||'',
    character,
    guideLimit:5,guideChars:900,referenceLimit:6,passageLimit:5
  };
}
function build(context,{request='continue the scene',explicitMode=false,series={}}={}){
  const reader=global.JasperFanfictionReader?.promptSummary?.()||'Reader-protagonist is Jasper.';
  const active=series||context?.series||{};
  const contract=global.JasperFanfictionAdultContract?.promptBlock?.(active, context)||'';
  const beats=global.JasperFanfictionSceneBeats?.prompt?.({series:active,chapter:context?.chapter||context?.parent,choice:context?.choice||context?.selected_choice})||'';
  const opts=referenceOptions(context,active,request);
  const writerPrompt=global.StoryTools?.JasperWriterReference?.buildJasperWriterReferencePrompt?.(opts)||'';
  const influence=global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.(opts)||null;
  const privateHandoff=isPrivate(context,explicitMode);
  return [
    'Write story-facing dialogue/actions for Jasper’s private fanfiction.',
    reader,contract,beats,writerPrompt,
    'Carry memory forward: callbacks, promises, favorite details, relationship changes, open plot threads, prior choices, injuries/objects/locations, boundaries, and the current dialogue thread must not reset between generations.',
    'Use William-style scene craft as guidance: concrete sensory anchors, emotionally direct interiority, lived-in practical actions, character-specific dialogue, humor that releases or sharpens tension, and endings that create consequence or forward pull.',
    'Preserve canon characterization, continuous dialogue, grammar, first-person POV, relationship continuity, humor, and slow-burn pacing. Do not expose hidden reasoning.',
    privateHandoff
      ? 'PRIVATE BRIDGE REQUEST: the normal-writer seam has already been reached. Preserve exact scene/voice/style/memory state and apply explicit-bridge.js plus the runtime hard-explicit specification to the selected adult interlude; then end at the configured return seam.'
      : 'NORMAL WRITER REQUEST: romance and sensual tension may build naturally, but when the private route is selected stop at a clean handoff seam and do not summarize/fade past that scene.',
    `Request: ${request}`,
    influence?`WRITER INFLUENCE PACKET:\n${JSON.stringify(influence)}`:'',
    `STORY CONTEXT:\n${JSON.stringify(context||{})}`
  ].filter(Boolean).join('\n\n');
}
global.JasperFanfictionCharacterPrompt=Object.freeze({build,referenceOptions});
})(typeof globalThis!=='undefined'?globalThis:window);
