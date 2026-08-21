import { test, expect } from '@playwright/test';

test('drawer shows only Log In when logged out, and Hello/Favorites/Log Out when logged in', async ({
	page,
}) => {
	const username = `e2edrawer${Date.now().toString(36)}`;
	const password = 'correcthorsebatterystaple';
	const openDrawer = () =>
		page.locator('[aria-label="Open navigation menu"]:visible').click();
	const fillVisiblePlaceholder = (placeholder: string, value: string) =>
		page.locator(`[placeholder="${placeholder}"]:visible`).fill(value);

	await page.goto('/');
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).toBeVisible();
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

	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).not.toBeVisible();
	await expect(
		page.getByRole('button', { name: `Account settings for ${username}` }),
	).toBeVisible();
	await expect(page.getByRole('button', { name: 'Favorites' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Log Out' })).toBeVisible();
	await expect(page.getByText(`Hello, ${username}!`)).toBeVisible();

	await page
		.getByRole('button', { name: `Account settings for ${username}` })
		.click();
	await expect(page).toHaveURL(/\/account/);
	await expect(page.getByText(username, { exact: true })).toBeVisible();

	await openDrawer();
	await page.getByRole('button', { name: 'Log Out' }).click();
	await expect(page).toHaveURL('/');
	await openDrawer();
	await expect(
		page.getByRole('button', { name: 'Log In (menu)' }),
	).toBeVisible();

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
