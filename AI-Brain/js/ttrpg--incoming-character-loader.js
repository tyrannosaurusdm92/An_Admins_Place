/* Genericized for AI-Brain capability use. Provenance group: character-voice-studio. */

(function(){
  function applyIncomingCharacterSheetData(payload){
    if(!payload || typeof payload !== 'object') return;
    var data = payload.character || payload.characterData || payload.sheet || payload.data || payload;
    if(!data || typeof data !== 'object') return;
    if(typeof window.loadSheet === 'function'){
      window.loadSheet(data);
    } else {
      Object.keys(data).forEach(function(key){
        var field = document.querySelector('[data-key="' + String(key).replace(/"/g,'\\"') + '"]');
        if(!field) return;
        if(field.type === 'checkbox') field.checked = !!data[key];
        else field.value = data[key] == null ? '' : data[key];
        field.dispatchEvent(new Event('input',{bubbles:true}));
        field.dispatchEvent(new Event('change',{bubbles:true}));
      });
    }
    document.dispatchEvent(new CustomEvent('universal:characterSheetApplied',{detail:{source:'external-page'}}));
  }
  window.UniversalCharacterSheet = window.UniversalCharacterSheet || {};
  window.UniversalCharacterSheet.applyData = applyIncomingCharacterSheetData;
  window.addEventListener('message', function(event){
    var msg = event.data;
    if(!msg || typeof msg !== 'object') return;
    if(msg.type === 'universal.characterSheet.load' || msg.type === 'universal.character.load' || msg.kind === 'universal-character-sheet'){
      applyIncomingCharacterSheetData(msg.payload || msg.character || msg.data || msg);
    }
  });
  window.addEventListener('universal:loadCharacterSheet', function(event){
    applyIncomingCharacterSheetData(event.detail || {});
  });
})();
