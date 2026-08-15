# Bob's Burgers Companion App

## Overview

A React Native app built with Expo, styled with NativeWind (Tailwind for RN),
using the Bob's Burgers API (https://www.bobsburgersapi.com/). Deployed to web via
Netlify. Cross-platform target: iOS, Android, and web.

## Tech stack

- React Native + Expo
- TypeScript
- Styling: NativeWind (Tailwind for RN)
- Backend: Node/Express + PostgreSQL (`server/`), a standalone project
  (its own package.json, not wired into the Expo app yet). Drizzle ORM,
  hand-rolled email/password + JWT auth (bcrypt). See `server/` for the
  route list; run `npm run dev` inside `server/` and
  `server/scripts/smoke-test.sh` to verify it end-to-end.
- Package manager: npm
- Linting/formatting: ESLint (`eslint-config-expo`, legacy `.eslintrc.js` —
  this project is on Expo SDK 51, which predates `eslint-config-expo`'s flat
  config support) + Prettier, bridged via `eslint-plugin-prettier` so
  formatting issues surface as lint errors. Run `npm run lint` before
  considering any change done; `npx eslint . --fix` applies safe fixes.

## Conventions

- Match existing file/folder structure under `app/` (Expo Router convention) —
  don't introduce a different routing or folder pattern without asking first.
- Use TypeScript strictly — no `any` unless there's no reasonable alternative,
  and explain why if you do.
- Prefer functional components and hooks; no class components.
- Keep components small and focused; extract shared logic into `hooks/`.

## Current priorities (in order)

1. Favorites sync across devices (exercises the auth/backend end-to-end —
   this is where the Expo app actually gets wired up to the `server/`
   backend: login/signup screens, token storage, calling the favorites
   endpoints)
2. Visual/style redesign now that we're on NativeWind
3. Loading/error states done properly (skeleton loaders, retry logic)
4. Offline support / cached data
5. "Random burger of the day" generator (AI-assisted feature)
6. Migrate authentication from hand-rolled email/password + JWT to Better
   Auth, once the above priorities are done. (Note: Lucia is deprecated as
   of March 2025 — don't use it. Auth.js is maintenance-only. Better Auth
   is the current recommended option for new projects.)

## Screen designs

### Home screen

- Search bar front and center (primary focus of the screen), live-filtering:
  a list directly on the Home screen filters in place as the user types,
  narrowing with each additional letter — not a static bar that navigates
  to a separate results screen. Covers all six categories: "Burgers of the
  Day", "Characters", "End Credits", "Episodes", "Pest Control Trucks", and
  "Stores Next Door".
- Hamburger menu (nav drawer) containing:
  - Login / Signup — build as a UI placeholder now (nav item + a stub
    screen); the `server/` backend now exists, so wire this up to it as
    part of priority #1 (favorites sync) above.
  - Links to all six category screens: "Burgers of the Day", "Characters",
    "End Credits", "Episodes", "Pest Control Trucks", "Stores Next Door"
- This replaces the current Home screen layout — ask before removing any
  existing functionality that isn't accounted for above.

## Working style

- I'm new to AI-assisted coding — explain non-obvious changes as you make them.
- Make one focused change at a time rather than bundling unrelated changes together.
- Show me the plan before large multi-file changes; smaller changes are fine to
  just make directly.
- After changes, remind me to run lint/tests before I commit.

## Testing

- Frontend unit/component tests: Jest (`jest-expo` preset) + React Native
  Testing Library. Run `npm test` (watch mode) or `npm run test:ci`
  (single run). Hook tests live next to their source (`hooks/*.test.ts`);
  screen tests live next to their source (`app/*.test.tsx`).
- Frontend E2E: Playwright, targeting the real static `expo export` build
  served locally (mirrors what Netlify actually serves in production).
  Run `npm run test:e2e`. Specs live in `e2e/`.
- Backend tests: Vitest + Supertest, run against the app's real Express
  instance (`server/src/app.ts`) and the real dev Neon database, with
  per-test cleanup. Run `npm test` from `server/`. Tests live in
  `server/test/`. `server/scripts/smoke-test.sh` remains as a manual
  full-lifecycle sanity check against a running dev server.
- New features should come with tests; don't skip this.
- CI: GitHub Actions (`.github/workflows/ci.yml`) runs all three suites
  (frontend typecheck/lint/Jest/Playwright, backend typecheck/Vitest) on
  every push to `main`/`dev` and on every pull request. The backend job
  needs `DATABASE_URL` and `JWT_SECRET` set as GitHub repo secrets (same
  values as `server/.env`) — without them, the backend job fails at the
  `npm test` step.

## Do not

- Don't add new dependencies without flagging it and explaining why.
- Don't rewrite unrelated files while working on a feature.
