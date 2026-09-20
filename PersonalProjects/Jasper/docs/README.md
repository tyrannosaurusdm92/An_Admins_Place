# Expand + Correct Pass 2 — Current longfic behavior

All five bundled fanfics remain complete 40-chapter authored stories. The reader now treats those 200 chapters as an authored continuity spine: early chapters emphasize chemistry, flirting, boundaries, plot, and trust, while the optional private handoff becomes visible only after the relationship reaches an earned later stage. Chapter 40 keeps two normal generated-continuation routes plus one optional private route, so chapter 41+ can continue indefinitely without resetting the relationship.

Generated continuations receive the authored closing anchor, relationship stage, open threads, series story/character bibles, William-style writer-reference packet, and branch consequence that led into generation. `js/explicit-bridge.js` remains the single user-owned private interlude bridge and is unchanged by this pass.

# Current authoritative architecture — Safe Writer + Private Bridge

The current build separates normal story writing from the private interlude. The normal writer handles plot, banter, humor, slow burn, personality, continuous dialogue, grammar, memory, continuity, plot-hole avoidance, relationship consequences, praise/affirmations, and aftercare/reconnection. It stops before nudity or sexual action. `js/explicit-bridge.js` owns only the deliberately selected private-interlude handoff. See `SAFE_WRITER_PRIVATE_BRIDGE.md`.

# Jasper Fanfiction Spot — Story-First Private Adult Project

This build keeps the mobile-first virtual-book reader and colorful fandom picker while routing generation through the configured Jasper Apps Script backend. **Ordinary generation is story-first**: plot, characterization, continuity, slow relationship growth, humor, conflict, grief, mystery, and emotional consequences come before sexual frequency. Sex is not required in every chapter.

A deliberately selected intimacy choice becomes a bounded private-generator handoff. The generated interlude preserves continuity and then offers **Return to the story**, which targets the next authored chapter. Ordinary generated choices remain ordinary `@generate` story continuations.

Jasper is a fixed adult reader born in 1999. No participant-age list, age-status form, or repeated 18+ confirmation is required. Explicitly under-18 scenarios remain blocked automatically.

The Solidified Writer production modules are fully integrated for writer memory, continuity, reference/style retrieval, story planning, branch state, and plot-hole auditing. There is one unified `explicit-bridge.js` and one user-editable instruction placeholder.

See `FULL_MERGE_STORY_FIRST.md`, `EXPLICIT_BRIDGE.md`, `PRIVATE_18PLUS_GENERATION.md`, and `ATTACHED_SOURCE_INTEGRATION.md`.

# Jasper's Fanfiction Spot

Open `index.html` directly in a browser or host the folder on GitHub Pages. The bundled fanfic library works from relative local files and does not require a server for reading.

## Reader

The project is now built as an interactive virtual book:

- the book occupies the reading surface;
- the compact bottom HUD opens the reader menu;
- the reader menu contains Library, Chapters, Search, Save, Undo, Bookmarks, story settings, zoom, sound, import/export, and folder tools;
- portrait uses one paper page at a time;
- landscape and desktop use a two-page spread;
- drag the outer page toward the binding to turn it;
- releasing a short drag cancels the turn, while a committed drag completes it;
- the HUD arrows and keyboard arrow keys are fallbacks for page turning;
- page-turn sound follows the physical page animation.

The current routes are:

- **Stars Between the Strings** — Steven Universe
- **Jasmine After Rain** — Avatar: The Last Airbender
- **Love & Duty** — Avatar: The Last Airbender
- **What the Armor Leaves Behind** — Fallout 4
- **After Always** — Harry Potter

Each bundled route contains 40 JSON chapters. Chapters are divided into book-sized reader leaves, followed by their CYOA decision leaf.

## Files

- `index.html` — virtual book + HUD shell
- `css/book.css` — book, mobile HUD, drawer, page-turn visuals, responsive layout
- `js/app.js` — reader UI, pagination, physical page-turn controller, save/search/navigation wiring
- `js/cyoa-story-engine.js` — CYOA story/branch/generation engine
- `js/fanfic-data.js` — offline mirror of bundled fanfic JSON
- `json/` — source fanfic library
- `assets/` — cover, paper texture, page-turn sound
