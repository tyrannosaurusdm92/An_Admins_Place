# Jasper Fanfiction Character Library

Built: 2026-09-20

This package contains **56 detailed fictional-character JSON profiles** for Jasper's private fanfiction generator.

## Scope

Seed profiles preserved/expanded: Severus Snape, Uncle Iroh, Greg Universe, adult Aang, adult Toph, adult Katara, and Paladin Danse.

Researched expansion fandoms: Hazbin Hotel, Palia, Coral Island, Resident Evil, Fallout 76, Marvel movie characters, DC movie characters, and Disney movie characters.

## Retrieval design

Every profile includes identity/continuity, adult gate, seed-character similarity, archetypes, canon grounding, dialogue voice, romance logic, brat-tamer fit, hard-explicit diction guidance, aftercare, first-person Jasper grammar contract, plot engines, anti-flattening rules, canon-state notes, and sources.

The target is **older/wiser or emotionally seasoned energy + goofy/character-specific sweetness + sappy explicit romance**, not a generic list of attractive characters.

## Fictional-only rule

No real people. Movie profiles refer only to the fictional character. Never pull the actor's real biography, relationships, interviews, off-screen behavior or identity into romantic/sexual text.

## Adult-only rule

Every romantic/sexual participant is 18+. Aang, Katara and Toph are included only as explicitly adult/post-canon versions. The library explicitly blocks Billy Batson/Shazam from adult erotic retrieval because magical adult appearance does not change child personhood.

## Important files

- `generator_character_rules.json` — global hard rules.
- `manifest.json` — all profile paths.
- `index.json` — reverse lookup by fandom, archetype and seed similarity.
- `MATCH_GUIDE.md` — quick-match clusters.
- `characters/<fandom>/<character>.json` — detailed generator profiles.

## Canon vs. inference

`canon_grounding` is source-oriented. `romance_writer_profile`, `brat_tamer_profile`, `adult_intimacy_voice`, `aftercare_profile`, and `story_engines` are generator inferences based on canon personality plus Jasper's private project preferences. They are not claims that canon depicts those characters practicing a particular kink.

## Research families

Palia profiles use the Official Palia Wiki, including current Build 0.206 pages for Hodari/Reth and romance/dialogue pages. Coral Island profiles use the current Coral Island Wiki. DC and Disney movie profiles prioritize official studio character/movie pages. Marvel profiles prioritize Marvel's on-screen/movie pages. Resident Evil uses Capcom's Resident Evil portal where available plus franchise reference pages. Fallout 76 and the original seed characters use current franchise reference sources listed per profile. Hazbin Hotel uses current character references, with continuity checked through 2026 material.

# EXPANSION PASS — 2026-09-20

This pass expands the character library from **56 to 134 detailed fictional-character profiles**.

It also adds persistent fanfic-continuation support through stable `character_id` values, per-character `continuation_profile` data, and `continuation_context_template.json`.

See:
- `POOL_AUDIT.md`
- `MATCH_GUIDE_EXPANDED.md`
- `manifest.json`
- `index.json`
- `continuation_context_template.json`
- `VALIDATION_EXPANDED.json`
