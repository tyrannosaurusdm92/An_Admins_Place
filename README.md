# An Admin's Place

**An Admin's Place** is a static, GitHub Pages-ready website editor for building multiple projects from draggable modules. It is designed for hobby/project sites where you want to design in-site, edit text directly, import code, save locally, and export a zipped folder containing HTML, CSS, JavaScript, JSON, and an optional Google Apps Script backend.

## What this includes

- Wix-like visual canvas with draggable and resizable modules.
- Direct text editing inside modules with `contenteditable`.
- Inspector for position, size, text color, background color, font size, radius, background image URL, link URL, custom HTML, custom CSS, custom JS, and module JSON.
- File import into selected modules for `.html`, `.css`, `.js`, `.json`, `.txt`, and `.md`.
- Local browser save/load.
- JSON project import.
- Preview of the exported site.
- Browser-side ZIP export with no external dependency.
- Generated project folders containing:
  - `index.html`
  - `css/styles.css`
  - `js/app.js`
  - `data/project.json`
  - `backend/Code.gs`
  - `README_DEPLOY.md`
- Attached repository adapters for profile/blog tools, link hubs, code modules, dice, document import, PDF/print export, map/grid tools, Foundry helpers, town/establishment generators, Onyx chatbot slots, Wix-inspired builder pieces, RPG/VTT/audio tools, fantasy map scanning/generation, and conversation scanner/randomizer modules.

## How the attached repositories are used

The attached repositories include a mix of static projects, framework projects, mobile apps, Docker tooling, Java/Foundry tooling, and large data-backed modules. A GitHub Pages-hosted editor cannot directly run every original runtime, so this project turns them into **placeable adapters**:

- **AnySpace** → profile/blog/community module.
- **Singlelink** → link hub module.
- **Code Modules** → custom code/import module and organized export style.
- **Dice Box** → dice roller adapter with a static fallback and replaceable 3D path.
- **DocScanner** → document/image import inbox module.
- **pdf-creator-node** → browser print/PDF adapter and Node PDF notes.
- **MapTool** → grid/token board module.
- **foundryvtt-docker** → Foundry/Docker helper/config module.
- **Town Generator Foundry Module** → town JSON/Foundry import helper.
- **Eigengrau's Generator** → establishment/NPC/place writing generator.
- **Onyx Scanner Randomizer** → Onyx chatbot slot with import path for full Onyx bundles.

## GitHub Pages setup

1. Upload this folder to a GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Choose the branch and root folder containing `index.html`.
4. Save and open the Pages URL.

## Google Apps Script setup for exported projects

1. Export a project ZIP from the editor.
2. Open `backend/Code.gs` from the exported ZIP.
3. Create a new Google Apps Script project.
4. Paste in the code.
5. Deploy as a Web App.
6. Paste the Web App `/exec` URL into the exported site settings or into the editor's backend field before export.

## Re-editing an exported project

Keep `data/project.json`. To continue editing later, open An Admin's Place and use **Import JSON**.

## Notes

This editor does not publish directly to GitHub or Google Apps Script because those services require your account authorization. It exports the exact files needed for manual upload/deployment.


## Wix pieces merged

The uploaded Wix-related archives are merged as drag-and-drop modules and adapter manifests rather than raw app frameworks. This keeps the editor deployable on GitHub Pages while still giving you usable pieces inspired by the repositories:

- React Native UI Lib design-system section
- Stylable theme-token panel
- Velo-style dataset / external DB bridge
- Headless CMS template planner
- Ecommerce / quote cart module
- CLI project scaffold card
- MCP / Skills library module
- Import-cost dependency auditor
- Interact behavior planner
- Mobile calendar, navigation shell, and notification preferences
- Detox / Apple Simulator testing dashboard

See `docs/wix-source-archive-inspection.md`, `docs/wix-source-archive-inspection.json`, and `data/wix-module-adapters.json` for the source-to-module mapping.


## RPG, worldbuilding, audio, and VTT tools merged

The newest uploaded archives are merged as placeable modules and source adapters:

- **mp3player** and **Player Mp3** → audio playlist/player modules for project music, ambience, or song demos.
- **Roll20 API Scripts** → Roll20 script vault, command/macro notes, and API install planning cards.
- **World Anvil templates** → article outline builder, template notes, and campaign writing blocks.
- **Foundry World Anvil integration** → World Anvil → Foundry journal sync checklist and metadata bridge.
- **Fantasy Map Generator** → map seed/settings launcher and map export/import slot.
- **Labyrinth Maker X** → browser dungeon/labyrinth generator card.
- **Dungeon Generator Tools** → room palette/pattern JSON planner.
- **pyvtt** → index-card scene board and external deployment notes.
- **Aedelore RPG Tools** → character sheet and DM session dashboard modules.
- **DungeonMasterTools.github.io** → quick reference, calendar, weather, and DM helper cards.

See `docs/rpg-tool-source-inspection.md`, `docs/rpg-tool-source-inspection.json`, and `data/rpg-tool-module-adapters.json` for the source-to-module mapping.

## Scanner, generator, and conversation-randomizer modules merged

The newest uploaded archives are merged as full static integrations plus draggable adapter modules:

- **Fantasy Map Scanner / Settlement Generator** → full source launcher, GeoJSON overlay/10-anchor planner, immersive settlement location generator, and Belavadös name/pronoun/deity generator.
- **Conversation Scanner Randomizer** → full source launcher, local conversation scanner/randomized response module, and response catalog/manifest builder.

Full static source folders were also copied into the editor so they can be opened directly when hosted:

- `integrations/fantasy-map-scanner-generator/index.html`
- `integrations/fantasy-map-scanner-generator/name_generator.html`
- `integrations/conversation-scanner-randomizer/index.html`

See `docs/scanner-generator-source-inspection.md`, `docs/scanner-generator-source-inspection.json`, and `data/scanner-generator-module-adapters.json` for the source-to-module mapping.



## Settlement, DungeonFog, VTT, and login modules merged

The latest uploaded archives were added as draggable modules and tool adapters:

- **immersive_locations.zip** → 52 individual settlement modules plus an index/picker. These are structured module cards, not copied standalone HTML pages. No SVG image assets from the immersive locations package were embedded or copied.
- **df2vtt-fgmodule** → DF2VTT / UniversalVTT / Fantasy Grounds conversion planner.
- **ModernSleekLogin** → static modern login/gate module with a backend-event hook placeholder.
- **DungeonFogMapTimer** → in-site mapmaking challenge timer module.
- **DungeonFog SVG Format** → SVG/LOS reference notes module only, not image assets.
- **DungeonFog Tile Assembler** → tile filename manifest planner module.

See `docs/settlement-location-source-inspection.md`, `docs/settlement-location-source-inspection.json`, `data/settlement-location-module-adapters.json`, and `data/immersive-settlement-records.json` for the source-to-module conversion notes.

## Expanded builder pass

This build adds the larger site-builder layer requested for **An Admin's Place**:

- Invisible snap grid by default, with optional visible grid toggle.
- Draggable/resizable modules on the workspace.
- Workspace zoom controls for editing larger layouts.
- Every module can collapse into a movable 75x75 hamburger bubble and open again.
- Multi-page project manager with per-page modules and export to `index.html` plus `pages/<slug>.html`.
- Mobile and desktop responsive export behavior.
- Retro MySpace-style page kits, guestbook, gallery, button/image link modules, calendar modules, MP3/social modules, game launcher modules, 10-person messenger, video room launcher, Arkenforge/Rustforged manifest tools, and split Life Simulator player/DM modules.
- HTML mobile games module can import a folder through the browser file picker and exports imported files into `games/<module-id>/`.

Some attached repos contain native, server, binary, or Docker pieces that cannot run directly on GitHub Pages. Those pieces are represented as editable modules, launchers, manifests, and Apps Script-backed records so they can still be used inside the static editor/export workflow.
