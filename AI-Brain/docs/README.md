# AI-Brain

AI-Brain is a project-agnostic intelligence corpus and routing layer for a Gemini-first backend. Its root is intentionally shallow: `index.html`, `js/`, `json/`, `docs/`, and `assets/`.

## Core architecture
The user describes an outcome in ordinary language. The backend and the JavaScript intelligence layer classify multiple simultaneous domains, infer hidden dependencies, use the knowledge index to shortlist relevant shards, retrieve only bounded context, combine it with project-scoped state/memory, and validate provenance, permissions, safety, continuity, and output structure.

## Project-name rule
Source project/runtime names are provenance, not capabilities. Reusable functionality has been generalized into things the AI can *do*: worldbuilding, simulation, NPC/agent behavior, TTRPG/VTT creation, writing/continuity, file consolidation, art/studio work, 3D modeling, coding, organization, research, health/support, accessibility, safety, and related cross-domain tasks.

## 3D integration
The supplied Blender, OpenSCAD, and MeshLab repositories were analyzed for reusable capability taxonomies. AI-Brain includes generalized 3D creation, modifier/node, parametric CSG, mesh processing/repair, format selection, and studio helpers. Upstream application source was not dumped wholesale into operational JS. Visual/audio/model samples are separated into `googledrive.zip`.

## Adding knowledge
Add new structured material under a shallow `json/<domain>/` folder and use clear metadata/tags where practical. Add JavaScript only when it supplies reusable routing, selection, validation, transformation, planning, or tool logic. Refresh the knowledge index after additions.

## Public index
The user-supplied `index.html` is preserved byte-for-byte.
