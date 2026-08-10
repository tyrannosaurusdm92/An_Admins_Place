# Consolidation Audit

## What was consolidated
- Project/runtime lineage tokens were removed from operational filenames so routing is capability-based rather than source-project-based.
- Opaque hash-only topic variants in the large support/medical corpus were normalized into semantic roles such as `evidence-dossier`, `evidence-sources`, `support-catalog`, `phase-model`, `context-scenarios`, and `support-scenarios`.
- Exact duplicates were checked by SHA-256.
- JavaScript generalized-name collisions were reviewed using normalized fuzzy similarity; **20** >=75% near-duplicate JS files were removed where named functions/classes/variables showed no unique capability.
- Distinct variants were preserved when they contained genuinely different knowledge or behavior.

## Why template-similar medical files were retained
Many supplied health/research files intentionally use common templates but cover different conditions, life events, evidence sets, contexts, or analytical purposes. Structural similarity by itself is not semantic duplication. Removing those files merely because their scaffolding is similar would discard meaningful topic-specific knowledge.

## 3D repositories
Blender, OpenSCAD, and MeshLab were transformed into reusable catalogs and original AI-Brain JS/HTML helpers. Their source project names are provenance only, not required user-facing module names. Upstream licenses are retained in `docs/`.

## Media separation
Images, SVG, animation/video/audio, and 3D model/sample files are absent from the six GitHub archives and are placed in `googledrive.zip` instead.
