# Package manifest

- Root entry point: `index.html`
- Styles: `css/book.css`
- Reader/UI: `js/app.js`
- CYOA/generation engine: `js/cyoa-story-engine.js`
- Single backend provider: `js/jasper-fanfiction-backend-provider.js`
- Single generation bridge: `js/explicit-bridge.js`
- Offline bundled library: `js/fanfic-data.js`
- Solidified Writer runtime: `js/fiction-writer.js`, `js/story-continuity.js`, `js/writer-memory.js`, `js/plot-hole-defeater.js`, `js/writer-reference.js`
- Jasper helper modules: the `js/jasper-fanfiction-*.js` files loaded by `index.html`
- Bundled data: five routes under `json/`, each with `series.json` and `01.json` through `40.json`
- Assets: `assets/book-cover.png`, `assets/paper.jpg`, `assets/page-flip.wav`
- Merge documentation: `docs/FULL_MERGE_STORY_FIRST.md`, `docs/WRITER_SOURCE_NOTES.md`, `docs/EXPLICIT_BRIDGE.md`
- Other project documentation remains under `docs/`

The browser package contains one HTML entry point and no nested ZIPs. The older `json_corrected` attachment was compared with the newer current library and did not contain any chapter position missing from the current 5-series/200-chapter JSON set, so it was not used to overwrite the newer corrected data.

The large deterministic regression catalogs from the Solidified Writer development package are intentionally excluded because they are test fixtures rather than runtime generation code. The production writer implementations are retained.

## Safe Writer / Private Bridge authoritative files

- `js/explicit-bridge.js` — single private-interlude bridge and single user placeholder
- `js/jasper-fanfiction-backend-provider.js` — Apps Script provider; ordinary story prompts stay before the private boundary
- `js/cyoa-story-engine.js` — CYOA routing and Return-to-story handoff
- `js/fiction-writer.js` — story-first request/choice planning
- `js/writer-reference.js` — writing-style and safe guide-reference extraction
- `js/writer-memory.js` — long-term writer memory
- `js/story-continuity.js` — continuity ledgers
- `js/plot-hole-defeater.js` — continuity/plot audits
- `docs/SAFE_WRITER_PRIVATE_BRIDGE.md` — current responsibility boundary

## Expand + Correct Pass 2 authoritative additions

- `json/authored-library-index.json` — compact 5-series/200-chapter authored continuity index used for audits/reference.
- Every authored chapter JSON now carries schema 6.4 continuity, writer-reference, generation-contract, and contextual private-handoff metadata.
- `js/writer-reference.js` — now builds both a William/Jasper/character style packet and an authored-continuity packet for generation and bridge context.
- `js/cyoa-story-engine.js` — filters private handoffs by earned relationship stage and binds chapter 41+ generation to the closing anchor of the authored arc.
- `js/jasper-fanfiction-continuity-memory.js` — persists richer authored/branch/style context.
- `js/plot-hole-defeater.js` — audits path-variant matching, continuity snapshots, writer-reference presence, duplicate choice keys, and late-story regressions.
- `docs/EXPAND_CORRECT_PASS2_AUDIT.json` — machine-readable final audit for this pass.
- `js/explicit-bridge.js` remains user-owned and unchanged byte-for-byte.

