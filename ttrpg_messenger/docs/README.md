# Tablegate TTRPG Messenger & Organizer

Open **messenger.html** from a normal HTTPS web host. It is the only HTML file in this package.

Tablegate combines an invite-only campaign messenger with a shared organizer:

- Discord-style campaign servers, categories, text channels, handout channels, DMs, roles, invitations, member moderation, reactions, pins, search, attachments, character personas, and auditable dice rolls.
- Browser WebRTC voice/video rooms, direct calls, mute, deafen, push-to-talk, camera, and screen sharing.
- Shared campaign task board.
- Calendar with player submissions and administrator approval.
- Availability records for sessions, appointments, birthdays, unavailable blocks, and preferred play windows.
- Permissioned TTRPG system library accepting JSON, PDF, DOCX, and TXT.
- Grounded rules assistant that searches indexed campaign material and can suggest a likely roll expression while citing the stored source excerpts.
- Progressive Web App installation on supported mobile and desktop browsers.

## Important deployment note

The included frontend still points to the supplied Apps Script deployment URL. The new organizer and rules actions require the included `backend/ttrpgmessenger.gs` to be deployed as a new version of that same web-app deployment. Until then, the organizer opens in a clearly marked local-preview mode.

No Windows batch file, PowerShell launcher, Node server, or secondary HTML page is included or required.
