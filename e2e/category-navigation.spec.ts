import { test, expect } from '@playwright/test';

test('drawer link navigates to the category screen and back', async ({
	page,
}) => {
	await page.goto('/');

	// Category links live inside the hamburger drawer now (closed by
	// default), not directly on the Home screen body.
	await page.getByLabel('Open navigation menu').click();
	await page.getByText('Burgers of the Day', { exact: true }).click();
	await expect(page).toHaveURL(/\/burgers/);

	// A real network round-trip to the third-party Bob's Burgers API is
	// real here — wait for the real UI to settle rather than asserting
	// immediately.
	await expect(page.getByText(/Name:/).first()).toBeVisible({
		timeout: 10_000,
	});

	await page.goBack();
	await expect(page).toHaveURL('/');
	await expect(
		page.getByPlaceholder('Search burgers, characters, episodes...'),
	).toBeVisible();
});

test('a direct link to a category screen works (not just in-app navigation)', async ({
	page,
}) => {
	// Only a real server can prove Expo Router's static export actually
	// handles a deep link — this is exactly the kind of thing RNTL's
	// simulated renderer can't verify at all.
	await page.goto('/characters');

	await expect(page.getByText(/Name:/).first()).toBeVisible({
		timeout: 10_000,
	});
});
