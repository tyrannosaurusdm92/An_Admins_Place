# Jasper's Fanfiction Spot

Open `index.html` directly in a browser. The reader is Windows-safe, uses
relative paths, and does not require a server, install step, account, or
network connection for the bundled routes.

The cover opens into a two-page book reader. The index/home section lists every
bundled fanfic by title and includes the **Create Fanfic** tab. The current
routes are:

- **Stars Between the Strings** — Steven Universe, Greg Universe / Adult Reader
- **Jasmine After Rain** — Avatar: The Last Airbender, original-series Uncle Iroh / Adult Reader
- **Love & Duty** — Avatar: The Last Airbender, Aang / Katara / Toph / Adult Reader
- **What the Armor Leaves Behind** — Fallout 4, Paladin Danse / Adult Reader
- **After Always** — Harry Potter, Severus Snape / Adult Reader

Each route contains 40 JSON chapters. Every chapter is choice-enabled, with
normal story paths plus an optional explicit adult branch generated through the configured story provider.

The Create Fanfic form accepts a title, fandom or game, premise, character
personalities, tone, canon notes, story bible, tags, length, and intimacy
level. A new CYOA route is written under
`json/<Fandom>/<Dashed-Story-Name>/` when a project folder is connected; its
button appears automatically in the home/index view. Standalone short-story
mode is also available.

`json/` is the source-format deliverable. `js/fanfic-data.js` is a complete
offline mirror so direct-file opening and hosted opening use the same routes.
`js/app.js` is the reader UI and `js/cyoa-story-engine.js` is loaded by
`index.html` before it; all three JavaScript files are part of the active
reader path.

The reader-proxy is an adult, unnamed first-person self-insert: I / me / my /
myself. Appearance, legal name, gender, and other fixed identity details stay
open through the configured generator when Jasper selects them. Bundled chapters remain story-first; optional adult intimacy branches generate on-page through the configured provider.
The private editor is deliberately local-only and is not copied into chapter
JSON.

The attached reference book was used only to restore the cover/open-book
interaction. Its poems, stories, data, and JavaScript are not part of this
package.
