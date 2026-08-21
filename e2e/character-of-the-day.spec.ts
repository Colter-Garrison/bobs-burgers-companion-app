import { test, expect } from '@playwright/test';

test('the Character of the Day card shows on Home and hides/returns with the search bar', async ({
	page,
}) => {
	await page.goto('/');

	await expect(page.getByText('Character of the Day')).toBeVisible({
		timeout: 20_000,
	});

	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);
	await search.fill('bob');
	await expect(page.getByText('Character of the Day')).not.toBeVisible();

	await search.fill('');
	await expect(page.getByText('Character of the Day')).toBeVisible();
});
