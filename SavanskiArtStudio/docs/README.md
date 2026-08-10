# Savanski Art Studio v1

Savanski Art Studio is a general-purpose creative workspace that combines a Microsoft Paint / AddText-style interface with layered editing, drawing, meme/text tools, collage building, background and color removal, VTT map helpers, lightweight animation, shared project assets, and optional 3D visual editing.

## Open it

Double-click `studio.html`. No other HTML file is required. The CSS, JavaScript, JSON configuration, app icons, and backend source live in the shallow folders beside it.

For installable/PWA behavior, service-worker caching, or the strongest browser clipboard permissions, serve the same folder over HTTPS. The editor itself is designed to open from `studio.html` as a normal local file too.

## Main workspaces

**Canvas** is the main drawing and image-editing workspace. It includes pencil/brush/marker/crayon/airbrush/neon drawing, erasing, flood fill, eyedropper, connected color removal, shapes, arrows, raster text, rectangle/ellipse/triangle/circle/free selection and crop, cut/copy/paste, layers, opacity, blend modes, transforms, filters, auto-enhance, transparent backgrounds, PNG/WEBP export, editable project files, and browser autosave.

**Collage** turns multiple uploaded images into editable layer arrangements. Layouts include 2×2, 3×3, 4×4, horizontal, vertical, hero-left, hero-top, triptych, and polaroid-style arrangements with gap, corner radius, background, contain, and cover options.

**VTT Map** adds square, hex, and isometric grids, cell scaling, distance units, a ruler, fog-of-war layer, reveal brush, radial lighting layer, large map presets, and access to the optional shared Drive library. All ordinary drawing, text, crop, collage, layer, filter, and image tools remain usable for maps.

**Animate** creates simple keyframed layer motion for X/Y offset, scale, rotation, and opacity. It previews frame interpolation and can record a WebM with the browser's `MediaRecorder` support.

**3D** imports GLB, glTF, OBJ, STL, FBX, DAE, 3MF, and AMF where the included three.js loaders support the file. It includes camera orbit, mesh selection, material color/metalness/roughness/opacity controls, wireframe, spin, pulse, chromatic lightning, GLB export, 3D screenshot-to-2D capture, 3D texture-to-2D extraction, and applying the current 2D composite back onto a selected 3D material. Draco and Basis/KTX2 decoder files from the supplied 3D studio are included for compressed model/texture support.

**Shared Library** searches the configured Google Drive library through the backend. Maps and images can be pulled into the canvas, small audio files can be previewed, and other files can be downloaded. This is an optional TTRPG/project-support tool, not the identity of the app.

## Color removal / background erasing

Choose the **Color erase** tool. The target is either the exact color under the click or the chosen target color, depending on the contiguous setting. **Similarity** controls how close neighboring colors may be. **Remove** controls how much alpha is removed, from 1% through 100%. With **Only connected pixels the click can reach** enabled, the operation flood-fills through connected matching pixels rather than deleting the same color everywhere. Use **Remove target across layer** for global chroma-key-style removal.

## Storage

Local project saves use IndexedDB, with an editable `.savanski.json` download available at any time.

The frontend is configured for the supplied Google Apps Script service. If personal Google Drive is not connected, cloud saves use the backend's per-client fallback storage. The **Connect my Google Drive** action opens the configured user-accessing Apps Script deployment and then **Refresh storage status** detects personal storage.

The supplied backend file is in `backend/Savanski_Art_Studio_Backend.gs`. Its configured folders are:

- backend-created system/audit files: `1sXLBNsZ_FaFi6LUx773gQUP1q6G0Leyk`
- fallback user-created storage: `11SdF1SSrbzBZ5nrgtDlmTqrEKjv-7Mj2`
- optional shared maps/images/audio/project library: `172HDX8KoXIS9lvAOpMxVYz6HrDQMlr-k`

The active web-app deployment is stored only in `js/backend-config.js`, not displayed in normal frontend UI. The Apps Script library identifier/version is also recorded there for deployment reference.

The backend design supports two deployments of the same `.gs` file: one shared-service deployment that executes as the service owner, and one personal Drive connector that executes as the user accessing the web app. `personalConnectorUrl` is currently set to the supplied deployment URL; if a distinct second deployment is created later, replace only that field.

## Branding and interface

The design uses the requested three-family spectrum: Cadmium Yellow → bright Cyan with Dodger Blue influence → Persimmon Orange. Cyan remains the center identity color. Broad surfaces use cyan-tinted neutrals. The complete rendered phrase “Savanski Art Studio” receives the Rubik Dirt webfont class; no other normal interface text receives that font.

The layout is desktop-like but responsive, with landscape phone/tablet use treated as a compact desktop canvas. Portrait mode remains usable and can show an optional rotation suggestion.

## Keyboard shortcuts

- Ctrl/Cmd + Z: undo
- Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: redo
- Ctrl/Cmd + S: local browser save
- Ctrl/Cmd + Shift + S: download editable project
- Ctrl/Cmd + C / X / V: selection copy / cut / image paste
- B: brush
- E: eraser
- T: text
- V: select
- I: eyedropper
- G: fill
- Delete: clear active layer

## Important limits

Canvas work is raster-based. Very large dimensions and many high-resolution layers can exceed mobile memory. Browser cloud requests also have practical request limits; the supplied backend caps inline binary transfer at 8 MB. Large shared-library files intentionally fall back to opening the Drive library rather than embedding enormous data URLs.

WebM export depends on `MediaRecorder`. PWA installation and service-worker caching require HTTPS or localhost. Clipboard image read/write permissions vary by browser. 3D support depends on WebGL and the exact source model format.

