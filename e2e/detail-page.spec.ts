import { test, expect } from '@playwright/test';

// Regression/coverage for CLAUDE.md priority #9: tapping a card (on a
// category screen, or in Home/Favorites search results) now opens an
// in-app detail page instead of an external link — see
// app/detail/[category]/[id].tsx, lib/categoryBio.ts, and
// lib/detailRoute.ts. Deliberately just another (hidden) screen on the
// existing Drawer, not a new navigator — no dedicated back button or
// swipe-back gesture, by design (see CLAUDE.md priority #9's note).
// The hamburger menu is how a user gets back to a specific category;
// the browser/OS back button also works, but — since Drawer screens are
// peers, not a stack, the same way switching Home/Characters/Episodes
// via the drawer already doesn't build linear history either — it may
// land on whichever drawer screen was open before, not necessarily the
// exact category the card was tapped from. Not tested here since it's
// inherent to using a Drawer at all, not a defect in this feature.
test('tapping a category card opens its detail page', async ({ page }) => {
	await page.goto('/characters');
	const firstCard = page.getByTestId('card-title').first();
	await expect(firstCard).toBeVisible({ timeout: 10_000 });

	await firstCard.click();

	await expect(page).toHaveURL(/\/detail\/characters\/\d+/);
	// "View on Fandom" only exists on the detail page itself, so it's an
	// unambiguous signal the right page actually loaded, not just the
	// right URL. Characters have their own Fandom wiki page (unlike
	// Burgers/End Credits/Pest Control Trucks/Stores, which link to
	// their episode's page instead), so this is available immediately,
	// no secondary episode fetch needed first.
	await expect(page.getByText('View on Fandom')).toBeVisible({
		timeout: 10_000,
	});
});

test('tapping a Home search result opens its detail page', async ({ page }) => {
	await page.goto('/');
	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	);
	await search.fill('bob');
	const firstResult = page.getByText(/bob/i).first();
	await expect(firstResult).toBeVisible({ timeout: 10_000 });

	await firstResult.click();

	await expect(page).toHaveURL(/\/detail\/.+\/\d+/);
});

test("a burger's detail page mentions its episode by name and links to that episode's Fandom page", async ({
	page,
}) => {
	await page.goto('/burgers');
	await page.getByTestId('card-title').first().click();
	await expect(page).toHaveURL(/\/detail\/burgers\/\d+/);

	// Burgers have no wiki page of their own — the detail page has to
	// resolve the associated episode (a second fetch, see
	// lib/categoryBio.ts's extractEpisodeIdFromUrl) before the bio can
	// name it and before the Fandom link has anywhere real to point.
	await expect(page.getByText(/\("/)).toBeVisible({ timeout: 10_000 });
	await expect(page.getByText('View on Fandom')).toBeVisible();
});
