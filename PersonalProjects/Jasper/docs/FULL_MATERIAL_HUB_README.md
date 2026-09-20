# Full Material Hub Pass

Date: 2026-09-20

This pass makes the **normal generator and explicit bridge share the same material resolver**.

## What was fixed

The prior merged build loaded the character library for the normal CYOA path, but the explicit bridge itself did not independently hydrate character research or People/Places material. The backend also did not explicitly persist the full resolved material packet.

The new `JasperFanfictionMaterialHub` fixes both gaps.

## Request path

Normal continuation:

`CYOA engine -> explicit bridge provider wrapper -> Material Hub -> backend provider`

Direct bridge call:

`JasperExplicitBridge.create / continue / branch -> Material Hub -> backend provider`

Both paths now receive the same relevant source packet.

## Materials available

- **159 unified character records**
- **134 latest research-library profiles** reconciled into those records
- character selection / adult / continuation rules
- continuation context template
- full authored-story continuity
- William writer-reference system
- writer memory and story continuity
- scene beats
- fandom, character, lore, relationship and setting contexts
- adult contract + Jasper reader profile
- **48 People+Places non-UI runtime modules**
- all **14 People+Places JSON data banks**
- People+Places person generation, name/cultural context, pronouns, physical description, personality, interests, life, work/education, locations, relationships, social graph, routines, memory, conversation, events, world simulation, search and statistics

The two standalone People+Places UI files are preserved in `docs/people-places-source-full/js/` but intentionally not executed inside the fanfiction program because they would try to install a second unrelated UI.

## Backend propagation

For `fanfic.create` and `fanfic.save`, the synced series now carries:

- `character_profile_ids`
- `character_library`
- `creation_sources`
- `materials_context`
- `materials_manifest`

The relevant material prompt is also injected into `story_bible`, while the resolved character prompt is added to `character_bible`.

For branch/continue calls the material prompt is also included in `direction`, so it is available even if the backend action only consumes its continuation instruction.

## Payload control

“All materials available” does **not** mean sending every profile and data bank on every chapter. That would bury the useful context.

The Material Hub keeps all sources searchable and sends the relevant resolved characters, current story rules, current authored continuity, current original-support world, and active specialist context for the scene.
