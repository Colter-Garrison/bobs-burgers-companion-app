import { test, expect } from '@playwright/test';

test('home page loads and the search bar live-filters as the user types', async ({
	page,
}) => {
	await page.goto('/');

	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);
	await expect(search).toBeVisible();

	// No query yet — no results section should be showing.
	await expect(page.getByText('No results found.')).not.toBeVisible();

	// Real keystroke-by-keystroke typing, not a single fireEvent.changeText
	// call like the RNTL test — this exercises the actual browser input
	// event pipeline, which a simulated renderer can't fully replicate.
	await search.pressSequentially('bob', { delay: 50 });

	// At least one Bob-related result (most likely a character named
	// Bob), sourced from the real live API.
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
