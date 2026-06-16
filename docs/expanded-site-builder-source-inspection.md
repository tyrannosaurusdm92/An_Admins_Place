# Expanded Site Builder Source Integration

Merged into An Admin's Place as draggable modules and site-builder runtime features.

## Core feature pass

- Every placed module can be dragged on the snap grid, resized, zoomed with the workspace zoom controls, edited, and collapsed to a movable 75x75 hamburger bubble.
- The grid is invisible by default but can be toggled visible for alignment.
- Projects now support multiple pages via the Pages manager. Export creates `index.html` and `pages/<slug>.html`.
- Exported projects include desktop absolute placement and mobile stacked responsive layout.
- HTML mobile game modules can import a game folder through the browser picker and export those files into `games/<module-id>/`.

## Source adapters

- Life_Simulator.zip: split into Player and DM module systems.
- ourspace_messenger_plugin_windows_safe: converted to a site messenger module for up to 10 users/channels.
- Video-Meeting-master: converted to a video room launcher module.
- Arkenforge-main: converted to a map/ambience manifest module.
- rustforged-main: converted to a native packager checklist/manifest module.

Some native/server pieces cannot run directly on GitHub Pages, so those are represented as editable manifests, launchers, checklists, or Apps Script-backed records rather than raw executable backends.
