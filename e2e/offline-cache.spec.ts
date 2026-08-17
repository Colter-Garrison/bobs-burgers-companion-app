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
	const firstBurgerName = page.getByText(/^Name:/).first();
	await expect(firstBurgerName).toBeVisible({ timeout: 10_000 });
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
	await expect(page.getByText(rememberedName!)).toBeVisible();
});

test('the Home search falls back to its cached data when the API becomes unreachable', async ({
	page,
}) => {
	await page.goto('/');
	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);
	await search.fill('bob');
	const firstResult = page.getByText(/bob/i).first();
	await expect(firstResult).toBeVisible({ timeout: 10_000 });
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
	await expect(page.getByText(/^Name:/).first()).toBeVisible({
		timeout: 10_000,
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
