# Scanner / Generator / Conversation Randomizer Source Inspection

Merged into **An Admin's Place** on 2026-06-16 09:00 UTC.

These uploads were added as placeable modules, searchable palette tools, source manifests, and full static integration folders.

## Added modules

- **Full Fantasy Map Scanner / Settlement Generator Launcher** (`full_fantasy_map_scanner_launcher`) — Map scanner/generator tools — source: `fantasy_map_scanner_generator (2).zip`
- **GeoJSON Overlay / 10-Anchor Location Planner** (`map_scanner_geojson_overlay_planner`) — Map scanner/generator tools — source: `fantasy_map_scanner_generator (2).zip`
- **Immersive Settlement Location Generator** (`settlement_immersive_location_generator`) — Belavadös/lore generator tools — source: `fantasy_map_scanner_generator (2).zip`
- **Belavadös Name / Pronoun / Deity Generator** (`belavados_name_lore_generator`) — Belavadös/lore generator tools — source: `fantasy_map_scanner_generator (2).zip`
- **Full Conversation Scanner Randomizer Launcher** (`conversation_scanner_full_launcher`) — Conversation scanner/randomizer tools — source: `conversation_scanner_randomizer.zip`
- **Conversation Scanner / Randomized Reply Module** (`conversation_scanner_randomizer_module`) — Conversation scanner/randomizer tools — source: `conversation_scanner_randomizer.zip`
- **Response Catalog / Manifest Builder** (`response_catalog_manifest_builder`) — Conversation scanner/randomizer tools — source: `conversation_scanner_randomizer.zip`


## Source mapping

### fantasy_map_scanner_generator (2).zip

Used for:

- Full Fantasy Map Scanner / Settlement Generator launcher.
- GeoJSON Overlay / 10-Anchor Location Planner.
- Immersive Settlement Location Generator.
- Belavadös Name / Pronoun / Deity Generator.

Important source behavior preserved as editor notes/modules:

- GeoJSON overlays remain hoverable/clickable overlays above the image.
- Location names are not printed onto the image itself.
- Location details belong in the inspector/location panel after selection.
- Cell editing uses 10 anchors.
- Export planning supports replacement GeoJSON, selected-location JSON, settlement JSON, and interactive HTML notes.
- The full source is copied to `integrations/fantasy-map-scanner-generator/`.

### conversation_scanner_randomizer.zip

Used for:

- Full Conversation Scanner Randomizer launcher.
- Conversation Scanner / Randomized Reply Module.
- Response Catalog / Manifest Builder.

Important source behavior preserved as editor notes/modules:

- Local/hosted JSON response catalogs.
- Recursive response extraction.
- Detection of topics, moods, needs, tasks, asks, questions, and intent signals.
- Candidate scoring and randomized reply selection.
- Recent-response memory.
- Safe JSON packet output.
- The full source is copied to `integrations/conversation-scanner-randomizer/`.

## Why these are adapter modules

Both uploads are static-browser friendly, so their full source folders are included. The editor palette also adds smaller editable modules because those are easier to drag into multi-project websites, customize in the inspector, and export as normal HTML/CSS/JS/JSON blocks.
