import { test, expect } from '@playwright/test';

// Regression coverage for the favorites-sync bug described in CLAUDE.md's
// "Home screen" section: Drawer.Screens never unmount, and each screen used
// to call its own independent copy of useFavorites(), so a toggle made on
// one screen never reached any other screen's already-mounted copy. Fixed
// by lifting useFavorites into a shared FavoritesProvider (hooks/useFavorites.tsx).
// Needs a real backend (server/) — favorites are a real API resource, not
// something this test can fake client-side.
test('favoriting/unfavoriting on one screen stays in sync with Favorites and other screens', async ({
	page,
}) => {
	const email = `e2e-favorites-sync-${Date.now()}@example.com`;
	const password = 'correcthorsebatterystaple';

	await page.goto('/signup');
	await page.getByPlaceholder('Email').fill(email);
	await page.getByPlaceholder('Password (min. 8 characters)').fill(password);
	await page.getByRole('button', { name: 'Sign Up' }).click();
	await expect(page).toHaveURL('/');

	await page.goto('/characters');
	const firstNameText = page.getByText(/^Name:/).first();
	await expect(firstNameText).toBeVisible({ timeout: 10_000 });
	// The Favorites screen renders the bare character name (no "Name: "
	// prefix) — see hooks/useSearchableItems.ts's `label: character.name`.
	const characterName = (await firstNameText.textContent())!.replace(
		/^Name:\s*/,
		'',
	);

	// Favorite it here, then confirm it shows up on the Favorites screen.
	// Document order matches: the first "Add to favorites" button belongs
	// to the same card as the first "Name:" text.
	await page.getByRole('button', { name: 'Add to favorites' }).first().click();
	await page.goto('/favorites');
	await expect(page.getByText(characterName)).toBeVisible();

	// Un-favorite from the Favorites screen — it should disappear from here
	// (this direction already worked before the fix)...
	await page
		.getByRole('button', { name: 'Remove from favorites' })
		.first()
		.click();
	await expect(page.getByText('No favorites yet.')).toBeVisible();

	// ...and Bug 1: the star on the ORIGINAL screen must also flip back to
	// unfavorited, not keep showing as favorited.
	await page.goto('/characters');
	await expect(
		page.getByRole('button', { name: 'Add to favorites' }).first(),
	).toBeVisible({ timeout: 10_000 });

	// Bug 2: re-favoriting from that same screen must make it reappear in
	// Favorites, not silently no-op against a stale list there.
	await page.getByRole('button', { name: 'Add to favorites' }).first().click();
	await page.goto('/favorites');
	await expect(page.getByText(characterName)).toBeVisible();

	// Clean up the test account so this doesn't accumulate users in the dev DB.
	page.once('dialog', (dialog) => void dialog.accept());
	await page.goto('/account');
	await page.getByRole('button', { name: 'Delete Account' }).click();
	await expect(page).toHaveURL('/');
});
