# Validation record

Validated September 19, 2026 before packaging.

- Python build-time augmentation completed for five routes and 200 chapter JSON files.
- Every route has 40 chapters and every chapter has exactly three available choices, including one local private continuation choice.
- Legacy `avatar-*` and `su-*` targets were repaired to stable route chapter IDs.
- `js/fanfic-data.js` is a complete direct-file/offline mirror of the JSON routes.
- `node --check` passed for `js/app.js`, `js/cyoa-story-engine.js`, and `js/fanfic-data.js`.
- Engine smoke test passed: offline bundle loading, route start, existing-chapter choice, undo, named branch creation, and branch restoration.
- New route folder calculation preserves the requested shape `json/<Fandom>/<Dashed-Story-Name>/`.
- The book opens from the Jasper cover asset, page-flip audio is set to lower volume and slightly slower playback, and the reference book's content is absent.
- Reader typography and controls were compacted, and every rendered page now measures its natural content and scales it down to the paper bounds before clipping; the fit recalculates on render, resize, and zoom.
- The open-book zoom control now remains available on creation/settings screens and ranges from 50% through 300%.
- Jasper title, index, and creation-form line spacing was increased; cadmium, persimmon, and cyan are limited to accent treatments rather than page fills.
- Bundled content remains PG-13 / fade-to-black; private editor text remains browser-local.

The five source routes remain separate JSON files so Jasper can inspect or
edit them directly in GitHub.
