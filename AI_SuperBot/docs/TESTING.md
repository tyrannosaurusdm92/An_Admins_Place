# Testing Checklist

## Static validation

- All 10 JavaScript files parse with Node.js syntax checking.
- `backend/Code.gs` is checked as JavaScript syntax after copying to a temporary `.js` path.
- Required top-level files and folders are present.
- HTML references only files in the requested structure.
- No API key or repository token is included.
- No unrelated project assets are included.
- ZIP integrity is verified with `unzip -t`.
- Final compressed size is measured after packaging.

## Browser smoke test

Serve the folder locally and verify:

1. Superbot loads without a console syntax error.
2. A new conversation can be created and deleted.
3. `/help`, `/calc 2+2*5`, `/json {"ok":true}`, `/text sample text`, `/hash hello`, `/search JavaScript`, and `/time` respond locally.
4. A local memory can be saved, searched, and forgotten.
5. A local skill can be enabled, disabled, and removed.
6. Workspace export downloads JSON and re-import restores state.
7. Text attachments appear in chat context.
8. Image attachments show as chips and are passed as data URLs to backend chat.
9. Health check changes the connection badge.
10. An authenticated normal chat request succeeds after repository/token configuration.

## Backend tests

Run `runSuperbotSelfTests()` from the Apps Script editor. Then test health, authenticated chat, memory, document generation, and any enabled image/3D providers using a registered repository.
