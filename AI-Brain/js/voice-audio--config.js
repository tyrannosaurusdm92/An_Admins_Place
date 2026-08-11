/* Genericized for AI-Brain capability use. Provenance group: voice-persona-creator. */
/* Locked backend targets. Static web code cannot truly hide endpoints. */
window.VOICE_STUDIO_CONFIG = {
  backendUrl: (window.UNIVERSAL_BACKENDS && window.UNIVERSAL_BACKENDS.audioEditing) || "https://script.google.com/macros/s/AKfycbxerPSjB0ZGAdopq-dCz7SYkKXwAMI9mRkA1H366MJm6DDWneC7ulm6zTdfLH8pnCghFw/exec",
  audioEditingBackendUrl: (window.UNIVERSAL_BACKENDS && window.UNIVERSAL_BACKENDS.audioEditing) || "https://script.google.com/macros/s/AKfycbxerPSjB0ZGAdopq-dCz7SYkKXwAMI9mRkA1H366MJm6DDWneC7ulm6zTdfLH8pnCghFw/exec",
  accentBackendUrl: (window.UNIVERSAL_BACKENDS && window.UNIVERSAL_BACKENDS.accentVoice) || "https://script.google.com/macros/s/AKfycbyr4TwLilCubnWm_g-N8nIZUiWR3GJ7-nzeV8dc1vJctcPHHFU3bCg96yi5retOUeZGfQ/exec",
  defaultOutputBaseName: "universal_voice_acapella",
  requestTimeoutMs: 180000,
  allowedAssetPermissions: ["own_voice", "licensed_actor", "public_domain_character_asset", "synthetic_original"],
  blockedPromptTerms: ["instrumental", "drums", "guitar", "bass", "piano", "synth", "orchestra", "violin", "trumpet", "beat", "808", "kick", "snare", "hi-hat", "flute", "strings"],
  forcedVocalTerms: ["voice only", "acapella", "isolated vocals", "no instruments", "dry vocal"],
  backendRoles: {
    audioEditing: "MP3/WAV conversion, voice editing, acapella/singing generation",
    accentVoice: "NPC biome accent resolution, accent profile shaping, accent-aware preview payloads"
  }
};
