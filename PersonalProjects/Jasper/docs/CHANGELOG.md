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
