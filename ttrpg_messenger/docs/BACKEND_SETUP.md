# Backend setup

The frontend is configured for:

- Web app deployment: `https://script.google.com/macros/s/AKfycbzS0tWjPKzKV6grrQ0Offg8kCYxVUhmji7QMJEDTwTWwL7Rl3cQWhFOANxyfTTbs6PkTQ/exec`
- Apps Script library ID: `18ET55A9uVNx3IUzoAM_eRj8v7jqagPgjVdxil3P1SoUqrFnnAJp6CjVr`
- Library version: `1`

## Upgrade the existing deployment

1. Open the Apps Script project that owns the supplied web-app deployment.
2. Replace the project code with `backend/ttrpgmessenger.gs`.
3. Add or replace `appsscript.json` with the included manifest.
4. In Apps Script **Services**, enable **Drive API**. This is optional for the messenger but required for best-effort PDF-to-text indexing.
5. Run `setupTtrpgMessenger()` once. It adds the new organizer, calendar, system-document, and rule-note sheets without deleting the existing messenger sheets.
6. Run `createHourlyMaintenanceTrigger()` once if the trigger does not already exist.
7. Deploy a **new version** of the existing web app, rather than creating a different deployment URL.
8. Execute as the deployment owner and allow access to anyone who has the link, matching the original backend configuration.

The frontend posts JSON as `text/plain;charset=utf-8` to avoid Apps Script CORS preflights.

## PDF indexing

TXT and JSON are decoded directly. DOCX text is extracted from `word/document.xml`. PDF extraction uses a temporary Google Docs conversion through the Advanced Drive service. If conversion is unavailable or the PDF is image-only, the file remains stored and downloadable with status `STORED_ONLY`; an authorized user can add a manual rule note with a page or section citation.
