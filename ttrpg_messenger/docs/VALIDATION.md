# Validation checklist

The packaged build was checked for:

- Exactly one HTML file: `messenger.html`
- Only the requested top-level folders: `js`, `css`, `json`, `docs`, `backend`, `data`, and `assets`
- No `.bat`, `.cmd`, or `.ps1` files
- JavaScript syntax for every browser script and service worker
- Apps Script syntax after copying the `.gs` source to a JavaScript syntax-check target
- Valid parseable HTML with the organizer workspace inside the authenticated app grid
- Backend route coverage for every organizer, calendar, system-library, and rules-assistant action used by the frontend
- Dedicated TTRPG upload permission working independently from ordinary chat-attachment permission
- PWA manifest, icons, service worker, install prompt handling, and responsive mobile layout
- Accepted system upload extensions limited to JSON, PDF, DOCX, and TXT
- Every newly submitted calendar item defaulting to `PENDING`, including submissions made by administrators
- Pending and private calendar visibility restrictions
- Upload controls hidden or disabled without the dedicated system-upload permission
- Mocked authenticated browser integration across messenger, organizer dashboard, tasks, calendar, approvals, TTRPG system library, grounded rules answers, and mobile navigation
- Source archive preservation and third-party notice inclusion

Live microphone/camera, Google Drive persistence, PDF conversion, and multi-user WebRTC testing require HTTPS plus the included Apps Script backend deployed as a new version. A TURN service may still be required for peers behind strict NAT or firewalls.
