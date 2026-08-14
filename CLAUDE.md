# Bob's Burgers Companion App

## Overview

A React Native app built with Expo, styled with Tamagui (migrating to NativeWind),
using the Bob's Burgers API (https://www.bobsburgersapi.com/). Deployed to web via
Netlify. Cross-platform target: iOS, Android, and web.

## Tech stack

- React Native + Expo
- TypeScript
- Styling: Tamagui (currently) → migrating to NativeWind (Tailwind for RN)
- Backend (planned): Node/Express + PostgreSQL, for user profiles and favorites
- Package manager: npm
- Linting/formatting: ESLint + Prettier (run before considering any change done)

## Conventions

- Match existing file/folder structure under `app/` (Expo Router convention) —
  don't introduce a different routing or folder pattern without asking first.
- Use TypeScript strictly — no `any` unless there's no reasonable alternative,
  and explain why if you do.
- Prefer functional components and hooks; no class components.
- Keep components small and focused; extract shared logic into `hooks/`.

## Current priorities (in order)

1. Add a search feature for characters/episodes/burgers of the day/pest control trucks
2. Migrate styling from Tamagui to NativeWind
3. Add backend (Node/Express + PostgreSQL) for user profiles + favorites
   - Auth: start with hand-rolled email/password + JWT (using a vetted hashing
     library like bcrypt — never roll your own crypto). This is for learning
     purposes; migrate to a library like Better Auth later once the basics work
     and are understood. (Note: Lucia is deprecated as of March 2025 — don't use
     it. Auth.js is maintenance-only. Better Auth is the current recommended
     option for new projects, but isn't a v1 priority.)
   - Endpoints needed: create profile; add/remove favorite "burger of the day"; add/remove favorite character; add/remove favorite "end credits" art; add/remove favorite episode; add/remove favorite "pest control truck sighting"; add/remove favorite "store next door"; fetch a user's favorites
4. Add testing (Jest + React Native Testing Library for units/components,
   Playwright for the web build)
5. Add GitHub Actions CI workflow that runs tests on push
6. Favorites sync across devices (exercises the auth/backend end-to-end)
7. Visual/style redesign once on NativeWind
8. Loading/error states done properly (skeleton loaders, retry logic)
9. Offline support / cached data
10. "Random burger of the day" generator (AI-assisted feature)

## Working style

- I'm new to AI-assisted coding — explain non-obvious changes as you make them.
- Make one focused change at a time rather than bundling unrelated changes together.
- Show me the plan before large multi-file changes; smaller changes are fine to
  just make directly.
- After changes, remind me to run lint/tests before I commit.

## Testing

- Test runner: (to be set up — Jest + React Native Testing Library)
- E2E: (to be set up — Playwright, targeting the Expo web build)
- Once test infra exists: new features should come with tests; don't skip this.

## Do not

- Don't add new dependencies without flagging it and explaining why.
- Don't rewrite unrelated files while working on a feature.
- Don't remove existing Tamagui usage until the NativeWind migration is
  explicitly underway (avoid a half-migrated inconsistent state).
