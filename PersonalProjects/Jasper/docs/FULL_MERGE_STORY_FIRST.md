# Fully Merged Story-First Runtime — 2026-09-19

This build merges the mobile Virtual Book/CYOA project with the production portions of Jasper Fiction Writer Solidified v4.

## Runtime authority

The Virtual Book remains the reader/save/navigation authority. The merged writer modules add continuity, story memory, reference/style retrieval, relationship/branch state, plot-hole audits, and request planning through the shared `StoryTools` namespace.

The older `json_corrected` package was compared against the current library. It contains the same 5 series / 200 chapter positions and is older than the current corrected JSON, so it is retained as reference input only rather than overwriting the newer no-fade chapter library.

## Story-first generation

Ordinary generated chapters use `mature_on_page` as the default generation mode. This means the generator may write mature romance and relationship development, but the project does not force sexual content into ordinary chapters.

Generated CYOA chapters use ordinary `@generate` targets for plot/relationship choices. At most one optional intimacy route uses `@generate-explicit-detailed` when it fits the established story.

## Private interlude handoff

When an explicit/private choice is deliberately selected:

1. the CYOA engine identifies the next authored, non-generated chapter;
2. the unified bridge records a bounded private-generator handoff;
3. the Apps Script provider receives the explicit mode and continuity context;
4. the generated interlude is stored as a generated chapter;
5. its decision leaf contains `Return to the story` targeting the next authored chapter;
6. relationship/emotional consequences remain in memory and carry forward.

This lets a former fade/cutaway location act as a generator seam without making the entire longfic a generated adult branch.

## One bridge / one user placeholder

There is only one generation extension bridge: `js/explicit-bridge.js`.

There is exactly one user-editable instruction string:

```js
const USER_PRIVATE_GENERATION_INSTRUCTIONS = String.raw`

`;
```

The same bridge wraps the single Apps Script provider and exposes itself as both `JasperFanfictionApp.explicitBridge` and `JasperFanfictionApp.generationBridge`.

## Solidified Writer modules retained

- `fiction-writer.js` — story-first request planning and relationship-stage pacing
- `story-continuity.js` — timeline/relationship/continuity validation
- `writer-memory.js` — persistent details, choices, boundaries, callbacks
- `plot-hole-defeater.js` — POV, continuity, consent and seam audits
- `writer-reference.js` — source/style/reference retrieval and Jasper project reference material

The huge deterministic regression catalogs from the Solidified Writer package were development fixtures rather than runtime generation logic. They were discarded from the browser build. The production code was preserved and encapsulated so the former ES-module globals cannot collide when loaded as classic GitHub Pages scripts.

## Source/licensing note

The Solidified Writer source notes state that SexTurn was reviewed for generic state-machine ideas without copying GPLv3 source, and the generic Ren'Py package was reviewed for branch/flag ideas without copying its source. The merged bridge keeps those independently implemented state/turn concepts.
