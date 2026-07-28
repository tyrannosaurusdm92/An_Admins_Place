# Superbot Intelligence / LLM Shell

This package contains only the dedicated Superbot interface, browser-side intelligence/orchestration code, Apps Script backend source, service worker, stylesheet, and documentation requested for the extracted AI subsystem.

## What it is

Superbot is a browser agent shell connected to the supplied Google Apps Script backend. The backend can call an API-hosted language model and approved tools when its Script Properties, repository registration, and credentials are configured. The browser also contains local conversation storage, local memories and skills, safe utility commands, attachment context, speech controls, and a large searchable specialist-prompt corpus for offline retrieval.

## What it is not

The ZIP does not contain OpenAI model weights, ChatGPT’s private system software, or a browser-embedded equivalent of a frontier model. File size does not create model intelligence. Cloud response quality depends on the model provider, model ID, API key, backend configuration, enabled tools, and current service availability.

The local corpus is a retrieval system. It can surface relevant specialist operating patterns when the cloud backend fails, but it does not perform neural inference and should not be described as equivalent to ChatGPT.

## Required structure

- `superbot.html`
- `js/` — 10 JavaScript files
- `bot.css`
- `service-worker.js`
- `backend/`
- `docs/`

No unrelated map, studio, directory, 3D editor, image, audio, or general-site assets from the uploaded project are included.

## Start

For basic local use, open `superbot.html`. For service-worker/PWA caching, serve the folder over HTTP rather than `file://`.

Examples:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/superbot.html`.

## Cloud connection prerequisites

The supplied backend requires more than the `/exec` URL. Authenticated actions require:

1. A deployed Apps Script project containing `backend/Code.gs`.
2. `OPENAI_API_KEY` set in Apps Script Script Properties.
3. `setupSuperbot()` run once.
4. A signed repository manifest created and committed.
5. The repository registered with `registerRepository(...)`.
6. The returned repository credential entered as the Project Token in Superbot Settings.
7. The registered `owner/repository` entered exactly in Settings.

A health check does not require the repository token, but chat, memory, generators, uploads, project actions, and tool calls do.

## Important client correction

The original uploaded browser client sent `Date.now()` in milliseconds. The Apps Script authorizer expects Unix seconds and rejects timestamps outside its configured age window. This version sends `Math.floor(Date.now() / 1000)`, matching the backend protocol.
