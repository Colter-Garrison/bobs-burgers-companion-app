import { test, expect } from '@playwright/test';

// Pure client-side routing, no live backend needed — the same reasoning
// as e2e/favorites-logged-out.spec.ts.
test('visiting /account directly while logged out redirects to /login', async ({
	page,
}) => {
	await page.goto('/account');

	await expect(page).toHaveURL(/\/login/);
});
