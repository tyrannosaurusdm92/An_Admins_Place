# Character Library Research — Pass 3

This pass adds `json/characters/` as the generator-facing character knowledge layer.

## Scope
- 40 detailed character profiles plus `index.json`.
- Canon characters are marked `canon_researched` and include source references.
- Story-original characters are marked `story_original` and are grounded only in the existing authored chapters.
- Same-name originals are separated by fandom/series. The Steven Universe Mara and Fallout 4 Mara are distinct profiles.

## Runtime behavior
`js/jasper-fanfiction-character-library.js` loads the index and relevant profile JSON, resolves cast by active series plus names in the chapter/choice context, and supplies a compact character packet to the CYOA engine and Writer Reference.

Writer Reference now combines:
1. Jasper POV/personality lock.
2. William Saville writing-style references.
3. authored continuity and relationship stage.
4. active canon/story-original character profiles.
5. the existing user-owned private bridge context.

## Canon research sources used
Avatar research used Paramount+ character material and Avatar Wiki pages for Iroh, Appa, Team Avatar and supporting characters.
Fallout 4 research used Fallout Wiki pages for Danse, Blind Betrayal, Haylen, Rhys, the Brotherhood roster, and Fallout 4 character references.
Harry Potter research used the official Harry Potter Encyclopedia / HarryPotter.com fact files for Snape, McGonagall, Harry, Voldemort, Dumbledore, Hagrid and Hogwarts staff context.
Steven Universe research used Steven Universe Wiki pages for Greg Universe, Rose Quartz, Lion, and series character history.

## Guardrails
- Profiles constrain voice; they do not replace authored story continuity.
- Adult postwar Avatar romance uses adult-era versions only.
- Story-original characters never inherit unrelated same-name lore.
- Supporting characters do not all become romantic candidates.
- Multiple characters in a scene retain distinct humor, authority, emotional habits and vocabulary.
