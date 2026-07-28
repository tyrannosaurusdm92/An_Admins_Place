# File Inventory

## Root

- `superbot.html` — dedicated Superbot user interface
- `bot.css` — complete responsive styling
- `service-worker.js` — offline application-shell cache

## JavaScript

1. `config.js` — defaults, capabilities, base system behavior
2. `utils.js` — DOM, escaping, Markdown, file, hash, download, and formatting helpers
3. `storage.js` — persistent conversations, settings, memory state, and IndexedDB file helper
4. `memory.js` — local memory and reusable-skill logic
5. `intelligence-corpus-part-1.js` — first ordered segment of the local specialist corpus
6. `intelligence-corpus-part-2.js` — second ordered segment of the local specialist corpus
7. `intelligence-corpus-part-3.js` — final ordered segment of the local specialist corpus
8. `retrieval.js` — weighted corpus search and explicit offline fallback
9. `tools.js` — calculator parser, JSON, text, hash, time, and commands
10. `llm-client.js` — Apps Script protocol and backend action client
11. `orchestrator.js` — command routing, context assembly, cloud/fallback logic, generators
12. `app.js` — interface rendering and event handling

## Backend

- `Code.gs` — complete single-file Apps Script backend inherited from and isolated out of the uploaded project
- `backend-config.json` — supplied endpoint and library reference

## Documentation

- `README.md`
- `DEPLOYMENT.md`
- `CAPABILITIES.md`
- `SECURITY.md`
- `LOCAL_CORPUS.md`
- `TESTING.md`
- `FILES.md`
- `LIMITATIONS.md`
- `LICENSE.md`
- `TEST_REPORT.md` — generated after validation
