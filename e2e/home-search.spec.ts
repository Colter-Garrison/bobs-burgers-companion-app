import { test, expect } from '@playwright/test';

test('home page loads and the search bar live-filters as the user types', async ({
	page,
}) => {
	await page.goto('/');

	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);
	await expect(search).toBeVisible();

	await expect(page.getByText('No results found.')).not.toBeVisible();

	await search.pressSequentially('bob', { delay: 50 });

	await expect(page.getByText(/bob/i).first()).toBeVisible();
});

test('a query matching nothing shows "No results found."', async ({ page }) => {
	await page.goto('/');

	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);
	await search.pressSequentially('zzzznomatch', { delay: 20 });

	await expect(page.getByText('No results found.')).toBeVisible();
});
