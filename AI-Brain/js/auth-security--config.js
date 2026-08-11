/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(){
'use strict';
const config=Object.freeze({
 appName:'ActiveWorkspace',version:'4.2.0',systemName:'D&D 5.5e: Universal Edition — Covenant Engine',maxParticipants:10,
 backend:Object.freeze({
  webAppUrl:'https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec',
  libraryUrl:'https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4',
  authWebAppUrl:'https://script.google.com/macros/s/AKfycbwK-F1BfXbkiVkQXFA0Z1acKxFJgeGU6zckChEmSc8ANqLA1mbqUOWSf6_H1CGFtwW7WA/exec',
  authLibraryUrl:'https://script.google.com/macros/library/d/1106qaBmwlp4RiIOrlBBbbDtKuYKsfqdadKhti6ovh6X4hD0TJTsVqxmm/5',
  timeoutMs:18000,pollMs:1800,heartbeatMs:120000}),
 authentication:Object.freeze({defaultCampaign:'Threads Of Peace',forgotTrigger:'#playerforgot',allowCreateAccount:true,enforceCapacity:true,sessionStorageKey:'activeworkspace.session.v4.2',legacySessionStorageKeys:Object.freeze(['activeworkspace.session.v4.1','activeworkspace.session.v4','activeworkspace.session.v3','activeworkspace.session.v3.1','activeworkspace.session.v3.2']),fragmentAuthorityRoute:true}),
 security:Object.freeze({serverAuthoritativeRoles:true,clientMayNeverGrantDM:true,localDMRecovery:false,persistPasswords:false,persistAuthorityFragment:false,sanitizePlayerEncounter:true,requireBackendSessionToken:true}),
 tokenLibrary:Object.freeze({localBase:'assets/tokens/',githubRawBase:'',manifestPath:'json/token_library_catalog.json'}),
 randomEncounters:Object.freeze({basePath:'assets/RandomEncounters/',cssPath:'assets/RandomEncounters/css/',jsPath:'assets/RandomEncounters/js/',jsonPath:'assets/RandomEncounters/json/',tokenBase:'../tokens/'}),
 rules:Object.freeze({beatsPerTurn:3,reactionsPerRound:1,pressStressCost:2,pressLimitPerRound:1,startingLevel:8,startingXp:34000,alignmentAxes:8,alignmentMin:0,alignmentMax:3000,alignmentPivot:1500}),
 defaults:Object.freeze({gridRows:20,gridCols:30,cellFeet:5,movementRule:'alternating-side-initiative',diagonalRule:'five-ten-five',hostileDelayMs:900,gridDetectionMinSpacing:12,gridDetectionMaxSpacing:240,gridDetectionConfidence:0.42})
});
Object.defineProperty(window,'ActiveWorkspace_CONFIG',{value:config,writable:false,configurable:false});
})();
