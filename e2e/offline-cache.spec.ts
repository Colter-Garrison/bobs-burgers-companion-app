import { test, expect } from '@playwright/test';

// Regression/coverage for CLAUDE.md priority #7 (offline support / cached
// data): hooks/useCategoryData.ts and hooks/useSearchableItems.ts save a
// successful fetch to on-device storage (lib/dataCache.ts) and fall back
// to it when a later fetch fails. This drives a REAL browser reload
// against a REAL blocked request, not a mock — the only way to confirm
// the app's own AsyncStorage-backed cache survives a reload and actually
// gets read back, the way a mocked unit test can't.
//
// The first two tests below block only the third-party Bob's Burgers API
// host, not Playwright's own static-export server (localhost:4173) — the
// app has no service worker, so a real fully-offline reload
// (context.setOffline) would fail to reload the page's own JS bundle at
// all, which is a separate PWA/installability concern, not what this
// feature is about. This exercises the fetch-fails-then-falls-back-to-
// cache path specifically.
const API_HOST = 'bobsburgers-api.herokuapp.com';

test('a category screen falls back to its cached data when the API becomes unreachable', async ({
	page,
}) => {
	// First visit succeeds normally, populating the on-device cache.
	await page.goto('/burgers');
	const firstBurgerName = page.getByTestId('card-title').first();
	await expect(firstBurgerName).toBeVisible({ timeout: 20_000 });
	const rememberedName = await firstBurgerName.textContent();

	await page.route(`**://${API_HOST}/**`, (route) => route.abort());
	await page.reload();

	// The offline banner (not the full-screen ErrorState) should show,
	// and the same data from the earlier successful visit should still
	// be there — this is the entire point of caching it in the first
	// place.
	await expect(page.getByText(/You.re offline/)).toBeVisible({
		timeout: 10_000,
	});
	await expect(page.getByTestId('card-title').first()).toHaveText(
		rememberedName!,
	);
});

test('the Home search falls back to its cached data when the API becomes unreachable', async ({
	page,
}) => {
	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);

	// useSearchableItems.ts only saves its offline-fallback cache once all
	// six category fetches succeed together (a deliberate choice — see the
	// comment there on why a partial snapshot isn't saved). That makes
	// this test's setup step six times more exposed to a single flaky
	// third-party response than a one-category screen's equivalent test
	// below — a transient failure on just one of the six silently skips
	// the cache save without failing anything visible yet, and only
	// surfaces later as a missing offline fallback. Retrying the load
	// until it's demonstrably clean (no partial-failure banner) keeps
	// that flakiness from leaking into the actual behavior under test.
	let loadedCleanly = false;
	for (let attempt = 0; attempt < 3 && !loadedCleanly; attempt++) {
		if (attempt > 0) await page.reload();
		await page.goto('/');
		await search.fill('bob');
		await expect(page.getByText(/bob/i).first()).toBeVisible({
			timeout: 15_000,
		});
		loadedCleanly = !(await page
			.getByText('Some results may be missing.')
			.isVisible());
	}
	expect(loadedCleanly).toBe(true);

	const firstResult = page.getByText(/bob/i).first();
	const rememberedText = await firstResult.textContent();

	await page.route(`**://${API_HOST}/**`, (route) => route.abort());
	await page.reload();
	await page
		.getByPlaceholder('Search burgers, characters, episodes...')
		.fill('bob');

	await expect(page.getByText(/You.re offline/)).toBeVisible({
		timeout: 10_000,
	});
	await expect(page.getByText(rememberedText!)).toBeVisible();
});

// Regression test for a real bug: the offline banner showed correctly,
// but going back online never cleared it — see useNetworkStatus.ts for
// the root cause (NetInfo's web implementation listens to the Network
// Information API's connection.onchange instead of the standard
// window 'online'/'offline' events whenever navigator.connection exists,
// which is true in Chromium, and that API doesn't reliably fire on a
// real disconnect/reconnect). This uses context.setOffline (a real,
// mid-session connectivity change, no reload) specifically because
// that's what actually exposed the bug — the API-blocking approach
// above never touches NetInfo's isOffline signal at all.
test('the offline banner appears when connectivity is lost and clears automatically once it returns, with no reload', async ({
	page,
}) => {
	await page.goto('/burgers');
	// Generous timeout to absorb ordinary third-party API latency for
	// this real (not mocked) initial load — see the file-level comment.
	await expect(page.getByTestId('card-title').first()).toBeVisible({
		timeout: 20_000,
	});
	await expect(page.getByText(/You.re offline/)).not.toBeVisible();

	await page.context().setOffline(true);
	await expect(page.getByText(/You.re offline/)).toBeVisible({
		timeout: 10_000,
	});

	await page.context().setOffline(false);
	await expect(page.getByText(/You.re offline/)).not.toBeVisible({
		timeout: 10_000,
	});
});
