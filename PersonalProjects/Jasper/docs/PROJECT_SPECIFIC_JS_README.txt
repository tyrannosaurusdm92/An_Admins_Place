Jasper Fanfiction CYOA JavaScript — project-specific pass

This package preserves all 21 JavaScript files from the supplied Jasper_Fanfiction_CYOA_JS_Reprogrammed_v2 package as one-to-one renamed/project-scoped files.

Core script order for a plain browser page:
1. js/jasper-fanfiction-reader-profile.js
2. js/jasper-fanfiction-writing-style.js
3. js/jasper-fanfiction-library-data.js
4. js/jasper-fanfiction-cyoa-engine.js
5. js/jasper-fanfiction-reader-app.js

The app will dynamically load jasper-fanfiction-cyoa-engine.js if the engine was not included first.

Reader profile
- Jasper is the fixed private reader-protagonist.
- Born in 1999; legal-adult flag is true.
- Nonbinary; they/them when another character refers to Jasper.
- First-person prose uses I / me / my / myself.
- AFAB anatomy vocabulary is stored in the reader-profile module and passed into adult-explicit generation context.

Adults-only explicit generation
- content_mode: adult_explicit
- Every sexual participant must be confirmed 18+.
- Entered character ages below 18 automatically disable adult-explicit mode.
- If adult status is not confirmed, the engine falls back to romance mode rather than producing sexual content.
- Adult-explicit prompt rules explicitly prohibit fade-to-black/cutaway shortcuts.
- Provider results containing common fade-to-black phrases are rejected for repair when adult-explicit mode is active.

JSON layout
Generated chapters are written as:
json/<FandomFolder>/<StoryFolder>/NN.json
with series.json stored in the same story folder. This matches the supplied corrected JSON layout such as Avatar/Love-And-Duty.

Generation provider hooks (first available wins):
- window.JASPER_FANFIC_STORY_PROVIDER
- window.JASPER_FANFIC_PROVIDER
- legacy window.CYOA_STORY_PROVIDER
- window.StoryGenerationProvider.generate
- window.AIBrain.story.generate
- window.AIBrain.generateStoryContinuation
- window.StoryAI.generate

The bundled local composer remains available for non-provider continuation. A connected generation provider receives the full Jasper profile, William-style profile, continuity, CYOA choice state, adult gate, and content-mode instructions.

Literotica tag taxonomy
The code uses https://tags.literotica.com/ only as an adult-story metadata/tag vocabulary reference. It does not depend on Literotica servers at runtime.

Local fallback behavior
The local non-AI fallback never substitutes a requested explicit sex scene with fade-to-black prose. If the branch text specifically asks for an explicit sexual scene and no story-generation provider is connected, the engine raises a clear provider-required error instead. This prevents silent cutaways while keeping the offline fallback useful for nonsexual chapters.

Existing imported chapters
Existing prose from the supplied corrected JSON is preserved verbatim. Older chapters that already contain fade-to-black wording are not rewritten by this JavaScript pass; the new rules apply to newly generated/continued chapters.
