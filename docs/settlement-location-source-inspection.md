# Settlement, DungeonFog, VTT, and login module merge

Merged into **An Admin's Place** version `1.4.0-settlement-vtt-modules-merged`.

## User-specific handling

- `immersive_locations.zip` was **not** merged as raw standalone HTML pages.
- Its settlement pages were converted into **52 draggable settlement modules** plus one module index/picker.
- No SVG image assets from immersive locations were embedded or copied. SVG files skipped: `0`.
- Each settlement module keeps a structured `module.json` payload with profile, service anchors, section names, and extracted source tables/text.

## Added module groups

- Immersive settlement modules
- VTT map conversion modules
- Access/login modules
- DungeonFog utility modules

## Added source adapters

| Source archive | Static editor adapter |
|---|---|
| `immersive_locations.zip` | settlement module set + extracted JSON records, without SVG images |
| `df2vtt-fgmodule-main.zip` | DF2VTT / UniversalVTT / Fantasy Grounds conversion planner |
| `ModernSleekLogin-main.zip` | modern login/gate module with backend event hook placeholder |
| `DungeonFogMapTimer-master.zip` | in-site mapmaking timer module |
| `DungeonFog-SVG-Format-master.zip` | SVG/LOS format reference notes module, not image assets |
| `tile-assembler-main.zip` | tile filename manifest planner module |

## Why these are adapters

Several sources are Python, PHP, userscript, or external-desktop workflows. GitHub Pages cannot directly run Python, PHP, userscripts inside DungeonFog, or Fantasy Grounds/Fantasy Grounds module generation. These were therefore converted into draggable planning, manifest, UI, and notes modules that can be exported with the project and connected to external workflows when needed.
