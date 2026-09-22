# Design sync notes (Bob's Burgers Companion)

This repo is an **Expo app, not a component library**: there is no Storybook and no library `dist/`. The sync packages `components/` itself.

## How the build works

- `buildCmd` = `node .design-sync/build-lib.mjs` (run from the repo root, after staging `.ds-sync/` and `npm i esbuild ts-morph @types/react` there — the script borrows `.ds-sync`'s esbuild). It writes a pseudo-package to `.design-sync/.cache/pkg/` (gitignored): `dist/index.cjs`, `dist/styles.css`, `dist/fonts/`, and a `.d.ts` tree from `tsc`.
- Then: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./.design-sync/.cache/pkg/dist/index.cjs --out ./ds-bundle` (or the `resync.mjs` driver with the same args).
- `.design-sync/lib/entry.tsx` lists the exported components and defines `BobsBurgersProvider` (SafeAreaProvider + the app's ThemeProvider) — the `cfg.provider` for every preview. **Adding a component to the sync = adding an export line there.**
- `.design-sync/lib/expo-router-stub.tsx` replaces `expo-router`, `expo-router/drawer` and `expo-router/react-navigation` in the library build only (designs have no navigator): `Link` passes `href` through, `useRouter` no-ops, `Drawer.Screen` renders nothing. If a component starts using another Expo Router API, add it to the stub or the build fails to resolve / crashes at render.

## Gotchas already solved (don't rediscover)

- **Output CommonJS, not ESM.** Several deps are CJS and call `require('react')`; with React external, esbuild's ESM output turns those into runtime `require` calls → every card fails with "Dynamic require of 'react' is not supported".
- **NativeWind on web = real DOM classes + static CSS.** The build uses `jsxImportSource: 'nativewind'` and compiles `global.css` with Tailwind (content = `components/` + `.design-sync/previews/`). Tailwind is JIT, so only classes used in those files exist — the conventions header enumerates them; re-validate that list after component changes.
- **`@expo/vector-icons` package root imports every icon family's font.** The build swaps it for a shim exporting only `MaterialCommunityIcons` (the only family the app uses); its 1.3 MB TTF is inlined as a data URL. esbuild's `alias` matches by *prefix*, so the swaps are an exact-match plugin instead.
- **Splash art** (`assets/images/*.png`, 4 MB, opaque) is embedded as JPEG q80 copies (~0.75 MB) via macOS `sips`; without `sips` the PNGs are embedded as-is (bundle ~7 MB). App assets are untouched.
- **Contracts:** the `.d.ts` extractor left `SearchItem`, `CategoryFilter`, `GenderOption`, `HairOption`, `Character`, navigator and RN style types undefined, and dropped `| null` from `DetailLayout.error/cachedAt`, `OfflineBanner.cachedAt`, `FilterPanel.sortDirection`. All are hand-written in `cfg.dtsPropsFor` — **update them when those props change** (they don't follow the source automatically).
- **Previews that open internal state** (`FilterPanel`, `ColorblindModeButton`) click the component's own toggle after mount, then blur: the component moves focus into the opened panel (a11y), and with no real pointer the browser draws the keyboard focus ring (`#7a2e45` from `global.css`), which mouse users never see.
- `ColorblindModeButton` is `cardMode: single` (its menu is a modal portal; `[GRID_OVERFLOW]` otherwise).

## Known render warns / deliberate choices

- `SplashOverlay` ships the **floor card** on purpose: it removes itself 2 s after the theme is ready (`MIN_DISPLAY_MS`), so no static preview can capture it.
- `DrawerContent` and `DrawerLink` have **one story each**: the app styles current and other drawer items identically (`drawerActiveTintColor === drawerInactiveTintColor`); "current" is `aria-current` only, so two stories rendered identically.
- `CategorySkeleton` pulses (Animated opacity), so each capture lands at a random opacity. Expected.
- `package-build` prints a `direct-eval` warning (`eval("require")("node:crypto")` inside a dependency's Node-only branch). Harmless in the browser.

## Re-sync risks

- **Preview content is inlined**: realistic API data (Bryce, "Dottie Minerva", P.F.E.T.A, …) and image URLs on `bobsburgers-api.herokuapp.com`. If that host moves, preview images break (components themselves are unaffected).
- **Drawer styling is copied** from `app/_layout.tsx` into `previews/DrawerContent.tsx` and `DrawerLink.tsx` (hex colors, Chewy 16). Change the drawer look → update those previews.
- **Conventions header** (`conventions.md`) enumerates the compiled class list and token names — re-validate on every sync.
- The build assumes: Expo SDK 56 / react-native-web 0.21 / NativeWind v4 + Tailwind 3; macOS `sips` for the JPEG step; `.expo/types` present only for typed routes (not required).
- Dark mode and colorblind palettes were not separately previewed (they're global provider state, not per-card); they follow from the shared classes/tokens.
