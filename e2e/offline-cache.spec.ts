import { test, expect } from '@playwright/test';

const API_HOST = 'bobsburgers-api.herokuapp.com';

test('a category screen falls back to its cached data when the API becomes unreachable', async ({
	page,
}) => {
	await page.goto('/burgers');
	const firstBurgerName = page.getByTestId('card-title').first();
	await expect(firstBurgerName).toBeVisible({ timeout: 20_000 });
	const rememberedName = await firstBurgerName.textContent();

	await page.route(`**://${API_HOST}/**`, (route) => route.abort());
	await page.reload();

	await expect(page.getByText(/You.re offline/)).toBeVisible({
		timeout: 10_000,
	});
	await expect(page.getByTestId('card-title').first()).toHaveText(
		rememberedName!,
	);
});

test('the Home search falls back to its cached data when the API becomes unreachable', async ({
	page,
}) => {
	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);

	let loadedCleanly = false;
	for (let attempt = 0; attempt < 3 && !loadedCleanly; attempt++) {
		if (attempt > 0) await page.reload();
		await page.goto('/');
		await search.fill('bob');
		await expect(page.getByText(/bob/i).first()).toBeVisible({
			timeout: 15_000,
		});
		loadedCleanly = !(await page
			.getByText('Some results may be missing.')
			.isVisible());
	}
	expect(loadedCleanly).toBe(true);

	const firstResult = page.getByText(/bob/i).first();
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

test('the offline banner appears when connectivity is lost and clears automatically once it returns, with no reload', async ({
	page,
}) => {
	await page.goto('/burgers');
	await expect(page.getByTestId('card-title').first()).toBeVisible({
		timeout: 20_000,
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
