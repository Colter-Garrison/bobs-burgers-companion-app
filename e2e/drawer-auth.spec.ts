import { test, expect } from '@playwright/test';

// Regression/coverage for CLAUDE.md priority #2: the hamburger drawer's
// auth section (Log In/Sign Up at the top, swapping to a clickable
// "Hello: email" once logged in; Favorites and Log Out only shown when
// logged in). components/DrawerContent.test.tsx covers this component in
// isolation with a mocked router and a stubbed DrawerItemList — this spec
// drives the real drawer, real routing, and a real backend instead.
//
// Drawer.Screens (and the drawer itself) never unmount, so the drawer's
// own "Log In"/"Sign Up" links stay in the DOM even while visually closed
// — the same accessible name as the login/signup screens' own submit
// buttons. components/DrawerContent.tsx gives the drawer links a distinct
// accessibilityLabel ("Log In (menu)"/"Sign Up (menu)") to keep them
// unambiguous; that's why this spec targets those, not the plain names,
// for the drawer's own links.
test('drawer shows Log In/Sign Up when logged out, and Hello/Favorites/Log Out when logged in', async ({
	page,
}) => {
	const email = `e2e-drawer-auth-${Date.now()}@example.com`;
	const password = 'correcthorsebatterystaple';
	// Drawer.Screens never unmount, so once more than one screen has been
	// visited, more than one (inactive, off-screen) header/toggle button
	// can match this label at once — :visible narrows to the one that's
	// actually on screen.
	const openDrawer = () =>
		page.locator('[aria-label="Open navigation menu"]:visible').click();
	// Same reasoning as openDrawer: once both /login and /signup have been
	// visited, their (both still-mounted) form fields share placeholder
	// text ("Email" is identical on both; "Password" is a substring match
	// of signup's "Password (min. 8 characters)"), so :visible picks out
	// only the one actually on screen.
	const fillVisiblePlaceholder = (placeholder: string, value: string) =>
		page.locator(`[placeholder="${placeholder}"]:visible`).fill(value);

	await page.goto('/');
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Sign Up (menu)' }),
	).toBeVisible();
	await expect(page.getByRole('button', { name: /^Hello:/ })).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Favorites' }),
	).not.toBeVisible();

	await page.getByRole('button', { name: 'Sign Up (menu)' }).click();
	await expect(page).toHaveURL(/\/signup/);
	await fillVisiblePlaceholder('Email', email);
	await fillVisiblePlaceholder('Password (min. 8 characters)', password);
	await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
	await expect(page).toHaveURL('/');

	// Now logged in: the top of the drawer should show "Hello: email"
	// instead of Log In/Sign Up, and Favorites should appear below the
	// six category links.
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: 'Sign Up (menu)' }),
	).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: `Hello: ${email}` }),
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Favorites' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();

	// "Hello: email" navigates to the account page, not a separate
	// "Account" link (there is no separate Account link anymore).
	await page.getByRole('button', { name: `Hello: ${email}` }).click();
	await expect(page).toHaveURL(/\/account/);
	await expect(page.getByText(email, { exact: true })).toBeVisible();

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
	await fillVisiblePlaceholder('Email', email);
	await fillVisiblePlaceholder('Password', password);
	await page.getByRole('button', { name: 'Log In', exact: true }).click();
	await expect(page).toHaveURL('/');

	page.once('dialog', (dialog) => void dialog.accept());
	await page.goto('/account');
	await page.getByRole('button', { name: 'Delete Account' }).click();
	await expect(page).toHaveURL('/');
});
