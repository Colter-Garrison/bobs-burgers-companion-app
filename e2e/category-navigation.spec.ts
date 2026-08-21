import { test, expect } from '@playwright/test';

test('drawer link navigates to the category screen and back', async ({
	page,
}) => {
	await page.goto('/');

	await page.getByLabel('Open navigation menu').click();
	await page.getByRole('link', { name: 'Burgers of the Day' }).click();
	await expect(page).toHaveURL(/\/burgers/);

	await expect(page.getByLabel(/^Add .+ to favorites$/).first()).toBeVisible({
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
	await page.goto('/characters');

	await expect(page.getByLabel(/^Add .+ to favorites$/).first()).toBeVisible({
		timeout: 10_000,
	});
});
