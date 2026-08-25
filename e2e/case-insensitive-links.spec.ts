import { test, expect } from '@playwright/test'

test('visiting /verifyemail (lowercase) redirects to the real Verify Email screen', async ({
	page,
}) => {
	await page.goto('/verifyemail?token=abc123')

	await expect(page).toHaveURL('/verifyEmail?token=abc123')
	await expect(
		page.getByRole('heading', { name: 'Verify Email' }).first(),
	).toBeVisible({ timeout: 10_000 })
})

test('visiting /resetpassword (lowercase) redirects to the real Reset Password screen', async ({
	page,
}) => {
	await page.goto('/resetpassword?token=abc123')

	await expect(page).toHaveURL('/resetPassword?token=abc123')
	await expect(
		page.getByPlaceholder('New password (min. 8 characters)'),
	).toBeVisible({ timeout: 10_000 })
})

test('an unrelated unknown path still shows the Page Not Found screen', async ({
	page,
}) => {
	await page.goto('/this-route-does-not-exist')

	await expect(
		page.getByRole('heading', { name: 'Page Not Found' }).first(),
	).toBeVisible({ timeout: 10_000 })
	await page.getByRole('button', { name: 'Go to Home' }).click()
	await expect(page).toHaveURL('/')
})
