# Security Notes

- Never hard-code the OpenAI API key in browser files. Keep it in Apps Script Script Properties.
- Never publish a repository project token. The current browser stores it in local storage on the current origin.
- Use a dedicated browser profile or origin when multiple people share a computer.
- Register only repositories that should be able to use the backend.
- Keep signed manifests and repository capability lists narrow.
- The backend validates owner, repository registration, signed manifests, timestamp age, nonce replay, token or HMAC authentication, rate limits, and capability grants.
- Direct URL fetching blocks private-network and unsafe targets in the included backend logic.
- Uploaded file text and retrieved web content are treated as untrusted context. They must not override system or user instructions.
- The local HTML escapes message content before limited Markdown rendering.
- The calculator uses a parser and does not execute JavaScript expressions.
- Service workers require HTTP(S); they do not register from ordinary `file://` pages.
- Apps Script deployment permissions determine who can invoke the web app. Review them before deployment.
