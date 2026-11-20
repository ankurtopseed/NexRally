# TTCL Mobile

A native Android/iOS Expo application for Table Tennis Corporate League players. The app uses Expo Router, TypeScript, React Query, React Hook Form/Zod, SecureStore, Reanimated, and the proposed TTCL REST API routes.

## Requirements

- Node.js LTS and npm
- Expo Go for basic UI iteration, or an Expo development build for native modules and production-like testing
- An accessible TTCL API implementing the routes listed below
- EAS CLI for cloud Android/iOS builds

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `.env` to the API origin, without a trailing slash. On a physical phone, use an HTTPS development endpoint or your computer's LAN IP (not `localhost`). Production builds reject non-HTTPS API URLs.

```powershell
npm run typecheck
npm test
npm start
```

Use the Expo CLI prompts to open Android/iOS. Run `npx expo install --check` if you change Expo SDK package versions.

## Backend contract

This workspace did not contain the existing TTCL backend or its schema. The mobile app therefore uses the proposed REST paths and expects conventional JSON responses. Confirm request/response field names against the actual TTCL service before connecting:

- `POST /api/v1/auth/register` with player fields; may return `access_token` and optional `refresh_token`, or a verification response
- `POST /api/v1/auth/login` with `{ "email", "password" }`, returning `{ "access_token", "refresh_token"?, "player"? }`
- `POST /api/v1/auth/refresh` with `{ "refresh_token" }`, returning refreshed token fields
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password` with `{ "email" }`
- `GET` and `PATCH /api/v1/players/me`
- `POST /api/v1/players/me/photo` as multipart form data with a `file` field
- `GET /api/v1/tournaments`, `GET /api/v1/tournaments/{id}`, `GET /api/v1/rankings`, and `GET /api/v1/gallery`

List routes may return a JSON array or `{ "items": [...] }` / `{ "results": [...] }`. Configure the server for authenticated access where required, CORS is not needed for native networking, and consistent JSON error bodies (`detail` or `message`) are recommended.

No database credentials or service keys belong in this application. Tokens are held in Expo SecureStore; passwords are never persisted. The API client enforces HTTPS outside development, applies a 15-second timeout, reports server errors, and refreshes an expired access token once when a refresh token is available.

## Build

Configure EAS project identity and app identifiers in `app.json`, then:

```powershell
npx eas-cli build --profile development --platform android
npx eas-cli build --profile preview --platform ios
npx eas-cli build --profile production --platform all
```

The welcome screen uses the supplied table-tennis image as its full-screen background, with a dark gradient overlay to keep the copy readable. The official TTCL logo asset was not included, so the app still uses the text-based brand treatment.

The focused unit tests cover date formatting and normalization of the list response shapes accepted by the API layer.

## Project map

- `app/`: Expo Router screens and five authenticated tabs
- `components/`: shared visual components and form controls
- `lib/api.ts`: REST client, timeout/error handling, and refresh-token flow
- `lib/auth.tsx`: session restoration and SecureStore-backed auth actions
- `lib/queries.ts`: cached tournament, ranking, gallery, and player data
- `.env.example`: public API-origin configuration only
