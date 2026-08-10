# Savanski Art Studio — Merge Audit

## Scope reviewed

The merge reviewed the supplied Effects Studio archive, its organized/slim variant, the 3D Effects Studio archive, the Belavados 3D Effects Studio archive, and the duplicate `(1)` copies present in the supplied sources.

The two 3D application JavaScript files were byte-identical; their primary code-level difference was branding/configuration such as the studio identifier and lightning label. The duplicate non-`(1)` and `(1)` 3D ZIPs were therefore not copied twice. The larger 2D Effects Studio and the organized/slim variant overlapped substantially, but the larger build contained an additional media-backed coloring sub-workspace plus expanded editor behavior. The coloring sub-workspace was intentionally excluded while useful editor logic was consolidated. Useful editor logic was consolidated instead of retaining both frontends.

## Required removals completed

- Removed every bundled source background image.
- Removed source sticker collections.
- Removed bundled audio.
- Removed the excluded coloring sub-workspace, including its HTML, bridge/host code, SVG pages, color guides, manifests, buttons, labels, and navigation.
- Removed source sample maps and demo artwork from the distributable package.
- Removed duplicate branded studio shells.
- Removed source asset manifests whose only purpose was to index stripped media.
- Did not copy source code into `docs` or `assets`.
- `assets` contains only resized forms of the supplied Savanski Art Studio app icon.

## 2D capabilities retained or rebuilt

The source 2D studio exposed layered raster drawing, multiple brushes, spray/fill behavior, text controls, shapes, filters, blend modes, animation concepts, project persistence, exports, and an asset library. The unified build keeps those concepts in a single editor and expands them with direct selection/crop shapes, cut/copy/paste, global and connected color removal with 1–100% removal strength, collage layouts, map helpers, IndexedDB project persistence, and a shared Drive library adapter.

## 3D capabilities retained or rebuilt

The supplied 3D studio used three.js and its addons for model import, orbit controls, mesh/material editing, effects, compressed texture/model decoding, GLB export, and surface-oriented workflows. The unified build retains the included three.js runtime/addons, Draco decoder, Basis transcoder, broad model loaders, material editing, wireframe, animated pulse/spin, chromatic lightning, GLB export, screenshot capture, and a 2D↔3D texture bridge. The 2D canvas is the primary painting surface, allowing an edited 2D composite to be applied to a selected 3D material instead of maintaining a second unrelated drawing interface.

## Backend alignment

The frontend service configuration is updated to the supplied 2026-08-08 deployment URL and Apps Script library identifier/version. Normal UI does not print backend URLs or folder identifiers. Cloud behavior matches the supplied backend actions:

- `ping`
- `connect`
- `storageStatus`
- `saveProject`
- `saveBinary`
- `listProjects`
- `getProject`
- `listLibrary`
- `getLibraryFile`

Backend system/audit output, fallback user storage, and shared TTRPG/project assets use the three folder IDs supplied for this studio.

## Branding audit

The supplied design file defines the official cyan-centered Cadmium–Persimmon system. The frontend implements the specified anchors and tint/shade families, keeps pure `#00FFFF` as the central identity color, and uses the extra-pale cyan neutrals for broad light surfaces. Bright identity colors use nearly-black cyan text rather than white text.

Rubik Dirt is scoped to `.savanski-art-studio-brand`. Only complete rendered occurrences of the full brand phrase receive that class. Standard menus, tool labels, buttons, fields, and body copy use ordinary system UI fonts.

## Responsive audit

The primary layout is a three-column desktop editor with tool box, canvas, and inspector. Breakpoints compress control widths for landscape phone/tablet use while preserving the same mental model. Portrait layouts keep the canvas usable and tuck the inspector off the right edge. A dismissible rotation suggestion appears only on portrait phone/tablet-sized screens when enabled.

## Packaging audit

Requested top-level structure is preserved:

- `studio.html`
- `js`
- `css`
- `json`
- `docs`
- `backend`
- `assets`

The only nested content was deliberately avoided; all dependency files sit directly within their requested top-level folder.

The final package cannot honestly remain around 180,000 KB after the explicit removal of bundled images, backgrounds, audio, stickers, excluded coloring media, and duplicate studio copies. Those media files accounted for the overwhelming majority of the source ZIP sizes. This build intentionally does not pad the archive with duplicate or meaningless data simply to hit a byte target.

## Static validation performed

- JavaScript syntax checked with Node for project-authored JS files.
- JSON parsed successfully.
- HTML references checked for missing local files.
- Excluded-feature strings/files scanned and removed from executable UI/code.
- Media audit confirms that `assets` contains only app-icon PNGs.
- Top-level folder/file layout checked against the requested shallow structure.
- ZIP manifest includes sizes and SHA-256 hashes for distributable files.

## Known browser-dependent behavior

- Google Drive connection depends on the Apps Script deployment mode and OAuth authorization.
- Service workers/PWA install require HTTPS or localhost, not `file://`.
- OS clipboard image access depends on browser permissions.
- WebM animation export depends on `MediaRecorder` support.
- WebGL/3D support depends on the device GPU/browser and the source model.
- Extremely large raster canvases may exceed mobile memory regardless of application code.
