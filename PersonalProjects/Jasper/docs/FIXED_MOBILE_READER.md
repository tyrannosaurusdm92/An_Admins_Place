# Fixed mobile reader — 2026-09-19

The Virtual Book reader is the runtime authority. The Rated-R/project-specific helper modules are retained in `js/`, but load only after the stable book engine and app so they cannot prevent the HUD from booting.

Always-visible bottom HUD:
- Menu
- Fanfic dropdown
- Create
- Save progress
- Undo
- Previous/next fallback page arrows

The menu drawer contains the full Library, chapter search/list, bookmarks/branch history, settings, zoom/sound, import/export, and project-folder controls.

Storage hardening: denied IndexedDB access no longer replaces the reader with an error screen; the project continues with browser/local JSON behavior when persistent file-handle storage is unavailable.
