# PostDate

React/Vite frontend with an Express/Mongoose API. Security and service integrations are prepared locally; this repository has not been deployed by this change.

## Run locally

Use Node 24.15 or later. Install dependencies:

```powershell
npm ci --prefix backend
npm ci --prefix frontend
```

Copy `backend/.env.example` to ignored `backend/.env`, generate a random JWT signing secret, and configure MongoDB and a verified Resend sender. Start the API with `npm run dev --prefix backend` and the frontend with `npm run dev --prefix frontend`. Never place secrets in frontend variables.

Production serves the built frontend and API from the same HTTPS origin. See [DEPLOYMENT.md](DEPLOYMENT.md) for Render, Atlas, Resend and Cloudinary setup, account requirements, monitoring, backup drills and release checks.

## Implemented flows

- Signup, real email verification, cookie-based login/logout and email password recovery.
- Authenticated profile details, tags, preferences and validated photo upload/delete/avatar selection.
- Filtered member discovery, persistent likes/passes, mutual matches and participant-only match history.
- Database-backed admin/moderator permissions, moderation and safety reporting.
- Shared production rate counters, security headers, strict CORS/CSRF validation and generic errors.
- Encrypted small-project database snapshots and safe restoration into an empty test database.

Photo URLs are public. Distance filtering is unavailable because location coordinates are not collected. Account access, real mail delivery, cloud assets and a live hosting topology still require external setup and verification.

## Verification

```powershell
npm test --prefix backend
npm run build --prefix frontend
npm audit
npm audit --prefix backend
npm audit --prefix frontend
```

162 tests across seven suites passed locally, including real disposable-MongoDB auth, recovery, ownership, matching, shared counters and backup restoration. Email/storage provider calls are mocked. The production frontend builds successfully. See [SECURITY.md](SECURITY.md) for controls, limitations and the optional Anthropic review template.
