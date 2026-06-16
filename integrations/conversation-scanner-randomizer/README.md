# Conversation Scanner Randomizer

Conversation Scanner Randomizer is an offline-friendly static chatbot helper. It scans incoming conversation text, finds relevant answers and responses from local JSON files, and randomizes the final wording so the bot is less likely to say the exact same thing twice.

## What it detects

- topics
- moods
- needs
- tasks
- asks
- questions
- intent signals
- keywords and triggers

## How the JSON directory works

Put response files inside the `json` directory. The browser app can read them in two ways:

1. **Local directory picker:** click **Select json directory** and choose your `json` folder. This reads every `.json` file available from that selected folder.
2. **Hosted manifest:** when hosted on a static site, click **Load starter JSON manifest**. The app loads `json/manifest.json`, then loads the files listed there.

Browser security rules do not allow a local HTML page to silently read a folder without the user choosing it, so the directory picker is required for local file use.

## JSON response fields

The engine recursively searches JSON for answer-style fields, including:

- `responses`
- `answers`
- `replies`
- `messages`
- `text`
- `content`
- `body`
- `templates`
- `variants`
- `phrases`
- `fallback`

It also uses signal fields to score relevance:

- `keywords`
- `triggers`
- `topics`
- `moods`
- `needs`
- `tasks`
- `asks`
- `questions`
- `intents`
- `tags`
- `category`
- `title`
- `description`
- `locale`
- `tone`

## Basic response entry

```json
{
  "id": "overwhelmed-support",
  "keywords": ["overwhelmed", "stressed", "too much"],
  "moods": ["overwhelmed"],
  "needs": ["grounding"],
  "responses": [
    "That sounds like a lot. Start with one small step and ignore the rest for one minute.",
    "Let us make this smaller: breathe, name the main problem, and pick the next doable action."
  ]
}
```

## Template variation

Responses can include light template variables:

```json
{
  "responses": [
    "{opener} I can help with {topic}.",
    "{acknowledgement} Let us handle this {slot:transition}.",
    "This can be {choice:short,clear,gentle,direct}."
  ]
}
```

Supported built-in variables include:

- `{userName}`
- `{userComma}`
- `{opener}`
- `{acknowledgement}`
- `{closer}`
- `{topic}`
- `{need}`
- `{mood}`
- `{intent}`
- `{question}`
- `{ask}`
- `{slot:name}`
- `{choice:a,b,c}` or `[[a|b|c]]`

## Main browser API

```html
<script src="conversation_scanner_randomizer.js"></script>
<script>
  await ConversationScannerRandomizer.loadHostedJson();

  const packet = ConversationScannerRandomizer.generateResponse(
    "please help me rewrite this answer so it sounds less repetitive",
    { userName: "Friend", tone: "warm", locale: "default" }
  );

  console.log(packet.text);
  console.log(packet.detected);
</script>
```

## API methods

- `loadJsonFiles(fileList)` — loads selected `.json` files from the directory picker.
- `loadHostedJson({ manifestUrl })` — loads files listed in a hosted manifest.
- `registerJson(fileName, data)` — adds one parsed JSON object.
- `registerJsonBundle(bundle)` — adds several parsed JSON objects.
- `scanConversation(text, options)` — returns detected topics, moods, needs, tasks, asks, questions, and intents.
- `generateResponse(text, options)` — scans, scores, randomizes, and returns a safe response packet.
- `createChatMessage(text, options)` — returns a chat-message shaped object.
- `resetHistory()` — clears recent-response memory.
- `resetAll()` — clears loaded files, custom settings, and recent-response memory.

## Safe output packet

Every generated response returns JSON with:

- `ok`
- `text`
- `response`
- `detected`
- `selected`
- `topCandidates`
- `fallbackUsed`
- `repeatedCandidateRepaired`
- `stats`
- `metadata`
- `error`

The app returns a safe packet even when no strong response is found.

## Files

- `index.html` — browser interface
- `styles.css` — layout and sizing
- `app.js` — demo page glue code
- `conversation_scanner_randomizer.js` — full scanner and randomizer engine
- `json/response_catalog.json` — starter response examples and phrase banks
- `json/scanner_rules.json` — starter detection rules
- `json/localized_responses.json` — starter localized response examples
- `json/manifest.json` — hosted JSON file list
- `docs/audit.md` — implementation notes

## Notes

This tool runs in the browser. It does not need Python, a server, a database, or any external service.
