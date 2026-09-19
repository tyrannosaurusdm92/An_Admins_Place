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
