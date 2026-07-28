# Backend Deployment

## 1. Create or open the Apps Script project

Paste the full contents of `backend/Code.gs` into the Apps Script editor as `Code.gs`.

## 2. Set Script Properties

In **Project Settings → Script Properties**, set:

- `OPENAI_API_KEY` — required for cloud model calls.
- `OPENAI_MODEL` — a model ID supported by the connected API account. The included backend default is inherited from the uploaded source and can be overridden here.
- `OPENAI_MEMORY_MODEL` — optional memory-extraction model.
- `OPENAI_IMAGE_MODEL` — optional image model.
- `GITHUB_TOKEN` — optional but useful for private repositories or higher GitHub API limits.

Do not put these values in HTML, JavaScript, JSON committed to a repository, or the downloadable ZIP.

## 3. Initialize

Run `setupSuperbot()` manually from the Apps Script editor and approve requested permissions. This creates the persistent spreadsheet, asset folder, installation secret, instance ID, and defaults.

## 4. Create the signed manifest

Run:

```javascript
createSignedManifest('YOUR_GITHUB_OWNER/YOUR_REPOSITORY')
```

Save the returned JSON as `superbot.manifest.json` at the registered repository root and commit it to the branch that the backend will verify.

## 5. Register the repository

Run:

```javascript
registerRepository('YOUR_GITHUB_OWNER/YOUR_REPOSITORY', 'main', 'token')
```

Copy the returned credential immediately. In token mode, the backend stores only its hash.

## 6. Deploy as a Web App

Deploy as a Web App using the access policy appropriate for the intended users. Copy the `/exec` URL into Superbot Settings if it differs from the supplied default.

## 7. Configure the browser

In Superbot Settings, enter:

- Apps Script `/exec` URL
- exact registered `owner/repository`
- project token returned during registration
- project ID and user ID

Select **Save & test**. The health route can succeed even when authenticated routes are not ready, so send a normal message after the health check.

## Apps Script library reference

The supplied library URL is retained in Settings and `backend/backend-config.json` for deployment reference. A library reference is not itself a callable chat endpoint and normally requires access through the Apps Script editor/account that owns or can access it.
