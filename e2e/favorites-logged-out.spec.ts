import { test, expect } from '@playwright/test';

// Full logged-in favorite coverage needs a real running backend + DB,
// which this suite's static-export webServer doesn't provide (see
// playwright.config.ts) — that logic is covered by the RNTL tests in
// components/FavoriteButton.test.tsx and hooks/useFavorites.test.ts
// instead. This one case is realistic here because it's pure client-side
// routing that happens before any network call.
test('tapping a favorite star while logged out routes to the login screen', async ({
	page,
}) => {
	await page.goto('/burgers');

	await expect(page.getByLabel('Add to favorites').first()).toBeVisible({
		timeout: 10_000,
	});

	await page.getByLabel('Add to favorites').first().click();

	await expect(page).toHaveURL(/\/login/);
});
