import { test, expect } from '@playwright/test';

// Pure client-side routing, no live backend needed — the same reasoning
// as e2e/favorites-logged-out.spec.ts and e2e/account-logged-out.spec.ts.
// Named distinctly from favorites-logged-out.spec.ts, which covers a
// different case: tapping a favorite star (not visiting this route).
test('visiting /favorites directly while logged out redirects to /login', async ({
	page,
}) => {
	await page.goto('/favorites');

	await expect(page).toHaveURL(/\/login/);
});
