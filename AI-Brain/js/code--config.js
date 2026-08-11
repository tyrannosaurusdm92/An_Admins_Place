/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(){
  'use strict';
  const LT = window.LifeTalk;
  const CONFIG = Object.freeze({
    appName: 'LifeSimulation NPC Dialogue Studio',
    schemaVersion: '1.0.0',
    storageKey: 'lifesimulation-npc-dialogue-studio',
    databaseName: 'LifeSimulationDialogueDB',
    databaseVersion: 3,
    backend: {
      endpoint: 'https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec',
      libraryUrl: 'https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4',
      libraryId: '1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb',
      libraryVersion: 4,
      timeoutMs: 30000
    },
    limits: {
      maxFileBytes: 25 * 1024 * 1024,
      maxZipExpandedBytes: 100 * 1024 * 1024,
      maxFilesPerDrop: 250,
      maxDocxTextChars: 1_500_000,
      maxBackendContextChars: 120_000,
      maxMessageChars: 8_000,
      maxRecordsPerImport: 25_000,
      maxConversationTurns: 500,
      maxPlayersPerSession: 24
    },
    builtInGenderIdentities: [
      'Agender','Bi-Gender','Cis-Female','Cis-Male','Demi-Female','Demi-Male',
      'Gender-Flexible','Gender-Fluid','Gender-Less','Neutrois','Non-Binary',
      'Poly-Gender','Trans-Female','Trans-Male'
    ],
    sourcePriorities: Object.freeze({ generated: 10, docxProject: 40, jsonProject: 50, scopedDocx: 60, scopedJson: 70, userAuthored: 100 }),
    playerSafeFields: Object.freeze(['npcId','name','aliases','pronouns','genderIdentity','species','lineage','culture','profession','public','factionIds','questIds','traits','dialogue','token','visibility','provenance']),
    defaultSettings: Object.freeze({
      projectName:'Untitled Homebrew World', genre:'Fantasy', era:3, language:'English',
      backendEnabled:true, backendEndpoint:'https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec',
      backendLibraryUrl:'https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4',
      backendTimeoutMs:30000, fallbackEnabled:true, defaultResponseMode:'adaptive', memoryTurns:18,
      responseWindowMs:7000, statePatchReview:true, dmPassphraseHash:'', visibilityMode:'player'
    })
  });
  LT.register('config', CONFIG);
})();
