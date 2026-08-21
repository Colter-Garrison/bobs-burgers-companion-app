import { test, expect } from '@playwright/test';

test('visiting /account directly while logged out redirects to /login', async ({
	page,
}) => {
	await page.goto('/account');

	await expect(page).toHaveURL(/\/login/);
});
