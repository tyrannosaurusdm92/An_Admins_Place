/* Genericized for AI-Brain capability use. Provenance group: player-reference-runtime-a. */
(function(){
  const checks=[];
  function ok(name,value){checks.push({name,ok:!!value})}
  ok('UPAD namespace',window.UPAD);
  ok('ProjectZip writer',window.ProjectZip&&ProjectZip.Writer);
  ok('Prompt library',Array.isArray(window.PROJECT_PROMPTS));
  ok('Storage state',UPAD.store&&UPAD.store.state);
  ok('Sorter',UPAD.sorter&&UPAD.sorter.build);
  ok('Assistant',UPAD.assistant&&UPAD.assistant.send);
  ok('3D creator bridge',window.UPAD3D&&UPAD3D.launch&&UPAD3D.openStudio);
  ok('3D creator modal',document.getElementById('creatorModal'));
  ok('Visual Studio modal',document.getElementById('studioModal'));
  console.table(checks);
  if(checks.some(x=>!x.ok))throw new Error('Smoke test failed');
})();
