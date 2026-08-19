import { test, expect } from '@playwright/test';

// Regression/coverage for CLAUDE.md priority #2: the hamburger drawer's
// auth section (only a Log In link at the top when logged out — Sign Up
// isn't a separate drawer link, it's reached from the Log In screen's own
// "Need an account? Sign Up" link — swapping to a clickable
// "Hello, {username}!" once logged in; Favorites and Log Out only shown
// when logged in).
// components/DrawerContent.test.tsx covers this component in isolation
// with a mocked router and a stubbed DrawerItemList — this spec drives
// the real drawer, real routing, and a real backend instead.
//
// Drawer.Screens (and the drawer itself) never unmount, so the drawer's
// own "Log In" link stays in the DOM even while visually closed — the
// same accessible name as the login screen's own submit button.
// components/DrawerContent.tsx gives the drawer link a distinct
// accessibilityLabel ("Log In (menu)") to keep it unambiguous; that's why
// this spec targets that, not the plain name, for the drawer's own link.
test('drawer shows only Log In when logged out, and Hello/Favorites/Log Out when logged in', async ({
	page,
}) => {
	// Letters/numbers only, matching routes/auth.ts's validation — base36
	// keeps the timestamp suffix short enough to stay under the 25-char
	// limit.
	const username = `e2edrawer${Date.now().toString(36)}`;
	const password = 'correcthorsebatterystaple';
	// Drawer.Screens never unmount, so once more than one screen has been
	// visited, more than one (inactive, off-screen) header/toggle button
	// can match this label at once — :visible narrows to the one that's
	// actually on screen.
	const openDrawer = () =>
		page.locator('[aria-label="Open navigation menu"]:visible').click();
	// Same reasoning as openDrawer: once both /login and /signup have been
	// visited, their (both still-mounted) form fields can share
	// placeholder text, so :visible picks out only the one actually on
	// screen.
	const fillVisiblePlaceholder = (placeholder: string, value: string) =>
		page.locator(`[placeholder="${placeholder}"]:visible`).fill(value);

	await page.goto('/');
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).toBeVisible();
	// components/DrawerContent.tsx gives this button a distinct
	// accessibilityLabel ("Account settings for {username}") separate from
	// its visible "Hello, {username}!" text, so a screen reader hears where
	// tapping it leads rather than just a bare greeting — that's the name
	// role-based lookups below have to match, not the visible copy.
	await expect(
		page.getByRole('button', { name: /^Account settings for / }),
	).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Favorites' }),
	).not.toBeVisible();

	await page.getByRole('button', { name: 'Log In (menu)' }).click();
	await expect(page).toHaveURL(/\/login/);
	await page.getByText('Need an account? Sign Up').click();
	await expect(page).toHaveURL(/\/signup/);
	await fillVisiblePlaceholder('Username (2-25 chars)', username);
	await fillVisiblePlaceholder('Password (min. 8 characters)', password);
	await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
	await expect(page).toHaveURL('/');

	// Now logged in: the top of the drawer should show "Hello, {username}!"
	// instead of Log In, and Favorites should appear below
	// the six category links.
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: `Account settings for ${username}` }),
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Favorites' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
	// Confirms the visible greeting itself, since the role/name check above
	// only proves the button (by its accessible name) exists.
	await expect(page.getByText(`Hello, ${username}!`)).toBeVisible();

	// "Hello, {username}!" navigates to the account page, not a separate
	// "Account" link (there is no separate Account link anymore).
	await page
		.getByRole('button', { name: `Account settings for ${username}` })
		.click();
	await expect(page).toHaveURL(/\/account/);
	await expect(page.getByText(username, { exact: true })).toBeVisible();

	// Log Out, from the drawer itself, lands on Home and flips the drawer
	// back to its logged-out state.
	await openDrawer();
	await page.getByRole('button', { name: 'Log Out' }).click();
	await expect(page).toHaveURL('/');
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).toBeVisible();

	// Log back in to clean up the throwaway account.
	await page.getByRole('button', { name: 'Log In (menu)' }).click();
	await expect(page).toHaveURL(/\/login/);
	await fillVisiblePlaceholder('Username', username);
	await fillVisiblePlaceholder('Password', password);
	await page.getByRole('button', { name: 'Log In', exact: true }).click();
	await expect(page).toHaveURL('/');

	page.once('dialog', (dialog) => void dialog.accept());
	await page.goto('/account');
	await page.getByRole('button', { name: 'Delete Account' }).click();
	await expect(page).toHaveURL('/');
});
