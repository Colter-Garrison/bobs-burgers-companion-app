import { test, expect } from '@playwright/test';

// Regression/coverage for CLAUDE.md priority #8: a random-but-daily-
// deterministic character card shown on Home in place of search results,
// which should disappear the moment the user starts typing and return
// when the search bar is cleared. See lib/characterOfTheDay.ts for the
// selection/blurb logic and hooks/useCharacterOfTheDay.ts for how it's
// wired to the real character data.
test('the Character of the Day card shows on Home and hides/returns with the search bar', async ({
	page,
}) => {
	await page.goto('/');

	// A real round-trip to the third-party Characters endpoint, not a
	// mock (see offline-cache.spec.ts for the fuller rationale) — a
	// generous timeout absorbs ordinary third-party latency without
	// weakening what's actually under test below.
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
