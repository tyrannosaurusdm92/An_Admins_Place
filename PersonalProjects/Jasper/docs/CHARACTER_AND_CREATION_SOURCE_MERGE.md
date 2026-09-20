# Character + People/Places Generator Merge

Date: 2026-09-20

## Result

The Pass-3 fanfiction generator now uses one canonical character library containing **159 profiles**.

Inputs:
- Pass 3 generator: 40 character profiles
- Expanded research library: 134 profiles
- Same-fandom/same-character overlaps merged: 15
- Final unique canonical records: 159

## Duplicate behavior

The canonical identity key is **fandom + fictional character**.

Examples:
- Avatar + Iroh from Pass 3 and Avatar + Iroh from the research library become one enriched `avatar-iroh` record.
- Fallout 4 + Nick Valentine likewise becomes one record.
- Avatar + Suki and Coral Island + Suki remain separate because the fandom differs.

Pass-3 information is not discarded during a duplicate merge. Its story-facing aliases, authored-series relationships, voice notes, and continuity functions remain, while the research profile is attached and mapped into additional romance/voice/brat/aftercare/adult-era fields.

## New-fic creation

`JasperFanfictionCreationSources.enrichSpec()` now runs before `engine.createStory()`.

It supplies:
1. matching canonical character IDs/profiles from the unified library;
2. an optional adult-only original supporting-person pool;
3. optional original locations generated from the clean People/Places source.

Generated People/Places content is **inspiration only**. It must not replace a named canon character or overwrite an established canon location.

## Continuation

Series store their resolved `character_profile_ids` and their creation-source packet. The normal character resolver receives those IDs on every later generation, so the same merged character profile remains available when continuing or branching the fic.

## Source integration

People/Places generation modules were bundled into:
- `js/jasper-fanfiction-people-places-source.js`

The fanfiction-facing adapter is:
- `js/jasper-fanfiction-creation-sources.js`

People/Places JSON data is under:
- `json/people-places/`

Original source documentation/licenses are preserved under:
- `docs/people-places-source/`
- `docs/character-library-source/`

## Protected file

`js/explicit-bridge.js` was not modified by this merge.
