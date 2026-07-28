# Local Intelligence Corpus

`js/intelligence-corpus-part-1.js`, `js/intelligence-corpus-part-2.js`, and `js/intelligence-corpus-part-3.js` are generated from the 2,033 specialist prompt records found in the uploaded project. Each source record is represented in eight operational modes:

1. source
2. builder
3. planner
4. reviewer
5. verifier
6. teacher
7. analyst
8. operator

This produces 16,264 searchable records. The variants make the same domain material useful for implementation, planning, review, testing, instruction, analysis, and operations.

The corpus is intentionally stored as three ordered browser-readable JavaScript files so the application can search it without a server or build step. All three files append to the same `window.SUPERBOT_INTELLIGENCE_CORPUS` array and must load in numerical order. It also accounts for most of the requested package size. It is meaningful retrieval material, not arbitrary padding.

Search is lexical and weighted by title, tags, mode, and prompt content. It is used in two ways:

- Selected excerpts are supplied as optional context to the cloud agent.
- When cloud chat fails and fallback is enabled, top matching records are returned with an explicit notice that the response is retrieval rather than generated reasoning.

Large local corpora increase browser parsing and memory use. For lower-memory devices, remove all three `js/intelligence-corpus-part-*.js` files, replace them with a smaller corpus, and keep the same global array name.
