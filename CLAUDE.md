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
- After completing a task in "Current priorities (in order)" cross off the task
  we completed instead of deleting it and renumbering the tasks.
- You can spin up Playwright, the front-end and back-end server, or anything else
  you need to self-verify but make sure to stop the process when you're done.

## Current priorities (in order)

1. ~~Fix the bugs associated with favoriting that're described under "Home screen"~~ DONE
2. ~~Update the hamburger menu to have log-in/sign-up at the top of the hamburger,
   that changes to "Hello: users email" once they're logged in, the account button
   is no longer there and instead you get to accounts by clicking the "Hello: users email",
   a new link to Favorites if a user is logged in that sits below the other six categories,
   and a log-out button at the bottom of the hamburger menu.~~ DONE (drawer colors from
   priority #3 were folded into this too, at the user's request)
3. ~~Visual/style redesign now that we're on NativeWind. Including updating the fonts and colors
   of the entire hamburger menu to match the rest of the app.~~ DONE (Home, the six categories,
   and Favorites now share the same bbYellow/bbRed boxed look; Hello/Log In/Sign Up/Log Out stay
   plain text; Log Out is pinned to the very bottom of the drawer)
4. ~~Loading/error states done properly (skeleton loaders, retry logic) and git rid of the hard
   coded 3 second loader. Make the app as quick and performant as possible.~~ DONE (shared
   useCategoryData hook + CategorySkeleton/ErrorState components across all 6 category screens
   and Home; fetch hooks now throw with a 10s timeout instead of silently swallowing errors;
   Home's search uses Promise.allSettled so one category failing doesn't blank out the rest)
5. Offline support / cached data
6. "Random burger of the day" generator (AI-assisted feature)
7. Add "dark mode/light mode" option
8. Migrate authentication from hand-rolled email/password + JWT to Better
   Auth, once the above priorities are done. (Note: Lucia is deprecated as
   of March 2025 — don't use it. Auth.js is maintenance-only. Better Auth
   is the current recommended option for new projects.)
9. Check the accessibility of the app, updating anything needed to make it as accessible as
   possible. Think about things like a user using a screen reader, or a user who navigates
   the app with features other than touch, or a user who's colorblind.
10. Update what happens when a user clicks a card in the Search bar results. It should take them to a screen with an ai synopsis on that episode/character/store next door/pest control truck or anything else the user clicks. From there the card should have a clickable link to the bobs-burgers-fandom-page. Ideally each synopsis page will have an image associated with the thing clicked on on the left, with the synopsis of the thing clicked on to the right of it. It should have the same red border, yellow background, and red font that everything else does with the green on the back of the screen.
11. Add filtering pills/filtering option on the Favorites screen so a user can filter their favorites between the six categories in the hamburger menu.

## Screen designs

### Home screen

- Search bar front and center (primary focus of the screen), live-filtering:
  a list directly on the Home screen filters in place as the user types,
  narrowing with each additional letter — not a static bar that navigates
  to a separate results screen. Covers all six categories: "Burgers of the
  Day", "Characters", "End Credits", "Episodes", "Pest Control Trucks", and
  "Stores Next Door".
- Hamburger menu (nav drawer) containing:
  - Login / Signup — build in the same way as most conventional apps, having
    login/signup at the top of the hamburger menu. Once the user is logged in
    it should show "Hello: users email" instead of login/signup. The log-in and
    sign-up fields should clear if a user navigates away from those screens or
    if they log in. Currently when you log in then log out the users email and
    password are still saved in the field. This should be styled with the same
    font and color scheme as the rest of the app with bbRed, bbYellow, and bbGreen.
  - Instead of a seperate Account button change it so the "Hello: users email" is
    clickable and navigates to the users profile page where they can delete their
    account.
  - Links to all six category screens: "Burgers of the Day", "Characters",
    "End Credits", "Episodes", "Pest Control Trucks", "Stores Next Door"
  - When a user is logged in a new link shuold appear at the bottom called
    "Favorites" where they can see any thing they've favorited. There's currently
    a bug associated with this feature where after you favorite something, then
    navigate to Favorites, then un-favorite the thing, it dissapears from
    Favorites (good, this is what we want), but the star is still selected when
    you see it in the other menues (bad, this is a bug). Also, when you try to
    re-favorite an item after you've unfavorited it it does not populate in Favorites
    again (bad, this is a bug).
  - When a user is logged in there should be a Log Out button at the very bottom
    of the drawer for them to log out with.
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
