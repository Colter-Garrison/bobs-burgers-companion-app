# Bob's Burgers Companion — how to build with these components

These are the real components of a Bob's Burgers fan app (search, category lists, favorites, detail pages), rendered on the web via react-native-web and styled with NativeWind (Tailwind). Everything is on `window.BobsBurgers`.

## Always wrap in `BobsBurgersProvider`

It supplies the theme (light/dark and colorblind palettes) and safe-area insets. Components that read the theme — `FavoriteButton`, `FilterPanel`, `CategorySkeleton`, `ThemeToggleButton`, `ColorblindModeButton`, `DrawerContent` — throw without it.

```jsx
const { BobsBurgersProvider, SearchResultCard, LoadMoreButton } = window.BobsBurgers

<BobsBurgersProvider>
  <div className="flex-1 bg-lightBg dark:bg-darkBg p-[10px]" style={{ minHeight: '100vh' }}>
    <div className="flex flex-col gap-[10px]">
      <SearchResultCard
        item={{ id: 'character-65', category: 'Characters', label: 'Bryce',
          image: 'https://bobsburgers-api.herokuapp.com/images/characters/65.jpg',
          itemId: 65, favoriteCategory: 'character',
          bio: 'Bryce is a High school student. First appeared in "Full Bars".' }}
        favorited={false} onToggleFavorite={() => {}} onPress={() => {}}
      />
      <LoadMoreButton onPress={() => {}} />
    </div>
  </div>
</BobsBurgersProvider>
```

## The look

- **Page**: sky-blue background (`bg-lightBg dark:bg-darkBg`), 10px padding and gaps.
- **Cards and controls**: 4px navy border, chambray fill, 8px radius — `rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[10px]`.
- **Text**: always the Chewy font in the accent color — `font-chewy text-lightAccent dark:text-darkAccent`, sizes `text-[12px]` (labels) to `text-[24px]` (titles).
- **Pills**: `rounded-full border-4 … px-4 py-2`; selected = `bg-lightAccent dark:bg-darkAccent` with `text-lightSurface dark:text-darkOnAccent`.

Always pair a light class with its `dark:` twin, as above.

## Only these utility classes exist

The stylesheet is compiled from the app's own code, so **any other Tailwind class does nothing**. Available: `flex flex-1 flex-row flex-col items-center items-start justify-center justify-between justify-end gap-1 gap-2 gap-[10px] p-2 p-[10px] p-[16px] px-2 px-3 px-4 py-1 py-2 ml-1 mt-2 w-full w-64 max-w-[320px] max-w-[420px] rounded-lg rounded-full border-4 border-transparent text-center underline font-chewy text-[12px] text-[14px] text-[15px] text-[16px] text-[20px] text-[22px] text-[24px]`, the colors `bg-lightBg bg-lightSurface bg-lightAccent border-lightAccent text-lightAccent text-lightSurface`, and the dark twins `dark:bg-darkBg dark:bg-darkSurface dark:bg-darkAccent dark:border-darkAccent dark:text-darkAccent dark:text-darkOnAccent`.

For anything else, use inline styles with the color tokens — **always with the fallback**, since the variables are only set while a colorblind palette is active: `var(--light-bg, #8FCBEA)`, `var(--light-surface, #C9D9E4)`, `var(--light-accent, #2C4A63)`, `var(--dark-bg, #222222)`, `var(--dark-surface, #323233)`, `var(--dark-accent, #66D9EF)`, `var(--dark-on-accent, #222222)`. Fonts: `fontFamily: 'Chewy'`.

## Component notes

- Nullable props mean "none": `DetailLayout` `error={null}` / `cachedAt={null}`; `OfflineBanner` `cachedAt={null}` hides the time.
- `DrawerContent` and `DrawerLink` come from the app's navigation drawer; `DrawerContent` needs `state`/`descriptors`/`navigation` (see its `.d.ts`). There is no router here — links and `DetailLayout`'s header title are inert.
- `FilterPanel` opens and closes itself (starts closed).
- Read each component's `.prompt.md` and `.d.ts` for its full API, and `styles.css` (with `_ds_bundle.css`, `fonts/fonts.css`) for the real stylesheet.
