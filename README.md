# TTCL Mobile

A native Android/iOS Expo application for Table Tennis Corporate League players.

## Setup

Install dependencies with `npm install`, then run `npm start`. The app defaults to the API at `https://api.ttcl.co.in`. To use another backend, copy `.env.example` to `.env`, set `EXPO_PUBLIC_API_BASE_URL` to its origin, and restart Expo. The older `EXPO_PUBLIC_API_URL` is supported if the new variable is unset. Physical devices cannot use the development computer's `localhost`. Production builds require HTTPS. Expo public environment variables are embedded at build time; rebuild after changing them.

Run `npm run typecheck` and `npm test` for validation. EAS build profiles are in `eas.json`.

## Backend integration

The deployed FastAPI contract is available at `https://api.ttcl.co.in/api/docs`. The app uses:

- `POST /api/auth/register` (multipart player fields), `POST /api/auth/mobile/login`, `POST /api/auth/mobile/refresh`, `POST /api/auth/mobile/logout`, `GET /api/auth/me`, and `POST /api/auth/forgot-password`.
- `PUT /api/players/me` and `POST /api/players/me/photo` to edit the profile.
- `GET /api/events?limit=200`, `GET /api/rankings`, and `GET /api/public/photos` for league data. Tournament details are derived from the events list because the API does not expose a single-event GET. The events endpoint currently returns at most 200 items.

The updated backend must be deployed with migration `0019_mobile_refresh_tokens` applied before mobile sign-in works. Configure `MOBILE_ACCESS_TOKEN_MINUTES=15` and `MOBILE_REFRESH_TOKEN_DAYS=30` on the backend, keeping the existing JWT signing secret unchanged.

Native authentication uses bearer access tokens and rotating refresh tokens stored together in Expo SecureStore. Concurrent expired requests share one refresh. Successful logout revokes the backend session. Expo web holds tokens in memory only, so reloading requires signing in again; it does not persist tokens in browser storage. Verification and password-reset links are sent by the backend and open the TTCL website. No database credentials or service keys belong in the app.

The gallery displays images; backend videos are not currently supported. The home screen does not invent player statistics the API does not supply.

The optional Expo web build requires its exact origin in backend `FRONTEND_ORIGINS` and CORS permission for the `Authorization` header. Native requests do not use browser CORS. Mobile requests omit cookies and do not require CSRF tokens.
