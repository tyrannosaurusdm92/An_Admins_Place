# 2026-09-20 — Expand + Correct Pass 2

- Standardized all 200 authored chapters on schema 6.4 with canon window, research alignment, narrative tense, continuity snapshot, writer-reference packet, generation contract, and private-handoff eligibility.
- Preserved all five 40-chapter authored stories and all existing prose while expanding metadata and runtime context in place.
- Fixed 120 stale private branch-state keys so every `private-handoff` choice now resolves to the matching path variant.
- Kept private choice objects in every chapter but hid them during chemistry/flirting/boundary-conversation stages; they become visible only once the relationship reaches testing-power-play or later.
- Added per-series story bibles, character bibles, generated-continuation contracts, branching policies, quality gates, and 40-chapter authored arc indexes.
- Added exact authored closing anchors and carry-forward packets so generated chapter 41+ continues the established relationship instead of restarting courtship.
- Expanded Writer Reference influence with series-specific texture, relationship pressure, continuity ledger, and William-style reference guidance.
- Expanded continuity memory and plot-hole auditing for authored anchors, choice/path matching, duplicate paths, stage continuity, and late-story regression.
- Made fallback generated choices character/series-specific and stage-aware.
- Made generated chapters first-class continuity sources: chapter 41 stores its relationship stage, writer-reference lineage, closing anchor, unresolved threads, and carry-forward state so chapter 42+ does not lose the authored spine.
- Fixed the last authored Iroh prose cutaway and one remaining generic second-person narration leak in Love & Duty while preserving scene meaning.
- Preserved `js/explicit-bridge.js` byte-for-byte unchanged.

# 2026-09-19 — Safe Writer / Single Private Bridge pass

- Normal writer now stops before nudity or sexual action.
- Plot, banter, humor, slow burn, characterization, grammar, continuous dialogue, memory, continuity, plot-hole avoidance, praise/affirmations, and aftercare/reconnection stay in the normal writer.
- `explicit-bridge.js` is the only private-interlude extension point.
- Added the user-supplied `LITEROTICA_REFERENCE` object to the bridge.
- Added one searchable llama placeholder; unchanged placeholder blocks private generation while ordinary story generation continues.
- Removed hard-explicit instructions from normal runtime prompts/helpers.
- Converted bundled JSON private-route metadata to clean handoff/resume instructions and rebuilt `fanfic-data.js`.
- Kept `@generate-explicit-detailed` only as a compatibility/routing target.
- Updated adult-only gating and story-first resume behavior.

# 2026-09-19 — JSON no-fade chapter pass

- Normalized all 200 chapter JSON files to schema 6.1.
- Removed legacy fade-to-black/cutaway wording from chapter metadata and generation hints.
- Repaired 31 chapter prose files containing implied skipped-intimacy/censorship transitions or generator-instruction leakage.
- Kept all 210 adult intimacy choices routed to `@generate-explicit-detailed`.
- Rebuilt `js/fanfic-data.js` from the corrected JSON library.
- Added `docs/NO_FADE_JSON_AUDIT.json`.

# 2026-09-19 — Virtual-book HUD + physical page turns

- Removed the large reader toolbar from above the book.
- Added a compact bottom mobile HUD inspired by the supplied app-shell template.
- Added an upward-opening HUD drawer containing Library, Chapters, Search, Save, Undo, Bookmarks, story settings, zoom, sound, import/export, and project-folder tools.
- Moved the fanfic library out of the paper pages so the book remains the visual focus.
- Reworked landscape/desktop reading into actual two-page story spreads; portrait remains one paper page.
- Ported the supplied reference book's physical page-turn interaction: 3D sheet rotation, lift, droop, fold ridges, curled edge, dynamic highlight/shadow, sound, drag progress, cancel, and completion inertia.
- Page grabs are primary. HUD arrows and keyboard arrows now call the same page-turn controller as drag gestures.
- Reduced chapter leaf word targets to keep prose contained inside paper without shrinking it into an unreadable column.

# 2026-09-19 — Mobile page-layout rebuild

- Rebuilt the reader around the actual viewport instead of a fixed page size.
- Chapters are split into real reader leaves before the decision page, so long story text no longer pours through one paper surface.
- Left-page branch/settings content now scrolls inside the paper rather than clipping below it.
- Kept zoom at 50–300%; zoom enlarges the whole book and uses the surrounding book area for panning instead of collapsing the layout.
- Moved zoom outside the reader-only toolbar so it remains available on the library and Create Fanfic screens.
- Compact mobile portrait and landscape toolbars preserve more screen height for the book.
- Removed the duplicate chapter page-number element that could visually overlap the reader.
- Kept the colored fanfic dropdown and the Create/Resume/Save/Import controls directly below the library tagline.

# 2026-09-19 mobile merge

- Replaced the fanfic card wall with one colored button dropdown.
- Moved Create/Resume/Save/Import/Folder controls directly under “Fanfic can branch, resume, and keep growing.”
- Preserved true book zoom from 50% to 300% without collapsing pages into a narrow text column.
- Added mobile portrait/landscape containment, 44px touch targets, wrapping, and internal page scrolling.
- Replaced every legacy `@private` branch with `@generate-explicit`.
- Explicit branches require confirmed adult characters and a configured story-generation provider; they never silently fade out or downgrade to non-explicit prose.
- Rebuilt the offline `fanfic-data.js` mirror from the updated JSON library.

# Changelog

## 3.1 — September 19, 2026

- Reduced reader, index, branch, form, and toolbar typography and control sizes.
- Added measured page-content fitting so open-book pages scale their contents down before clipping, including home, chapter, settings, private-draft, and ending screens.
- Kept zoom controls available; page fitting recalculates after zoom changes, window resizing, and dynamic page renders.

## 3.0 — September 19, 2026

- Merged five 40-chapter fanfic routes into one title-based library index.
- Added choices to the formerly linear Avatar, Fallout 4, and Harry Potter routes.
- Added a complete offline chapter mirror in `js/fanfic-data.js`.
- Added cover open/close behavior using the Jasper cover asset.
- Added browser progress saves, automatic decision branches, undo, named bookmarks, and branch restoration.
- Added the Create Fanfic tab to the home/index section, including fandom and dashed story-folder generation.
- Lowered page-flip volume and slowed playback slightly for a more realistic turn.
- Kept the supplied reference book's prose, data, and JavaScript out of the package.

## 2.0 — September 19, 2026

- Expanded Greg Universe and original-series Uncle Iroh to 40 chapters each.
- Converted the reader-proxy to first person.
- Added chapter choices, path memory, and generator-backed adult branching.
- Kept the project fanfiction-only and removed unrelated poetry and short stories.


## 2026-09-19 — Fun-color fanfic dropdown restored
- Replaced the native HUD fanfic select with the prior colored button-style dropdown.
- Restored fandom palettes for Avatar, Fallout 4, Harry Potter, and Steven Universe in both the HUD dropdown and drawer library.
- Kept the repaired mobile-first page-turn/navigation runtime unchanged.

## 2026-09-19 — automatic adult-only gate
- Removed the participant-age list and repeated adult-confirmation checkbox from Create and Story Settings.
- Jasper is fixed as the sole adult reader (born 1999).
- Adult-only character enforcement is automatic; explicitly under-18 prompts are blocked and younger canon versions are shifted to adult/post-canon eras.
- Generation mode remains forced to `explicit_detailed`; no romance/general safe-mode fallback is exposed.

## 2026-09-19 — Fully merged story-first writer runtime

- Merged the production Solidified Writer modules into the mobile Virtual Book runtime.
- Replaced both generation bridges with one `explicit-bridge.js` and one user-editable placeholder.
- Ordinary generation now uses story-first `mature_on_page`; explicit generation is a deliberate optional handoff.
- Explicit/private interludes return to the next authored chapter when one exists.
- Corrected backend-provider logic that previously promoted every generation mode/choice to `explicit_detailed`.
- Corrected Create/Settings adult-era initialization order and the local composer undefined-variable defect.
- Encapsulated converted writer modules to prevent classic-script lexical collisions on GitHub Pages.
- Removed only non-runtime regression fixture catalogs from the Solidified Writer modules.
