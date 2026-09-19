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
