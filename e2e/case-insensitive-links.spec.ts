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

test('visiting /forgotusername (lowercase) redirects to the real Forgot Username screen', async ({
	page,
}) => {
	await page.goto('/forgotusername')

	await expect(page).toHaveURL('/forgotUsername')
	await expect(
		page.getByRole('heading', { name: 'Forgot Username' }).first(),
	).toBeVisible({ timeout: 10_000 })
})

test('visiting /forgotpassword (lowercase) redirects to the real Forgot Password screen', async ({
	page,
}) => {
	await page.goto('/forgotpassword')

	await expect(page).toHaveURL('/forgotPassword')
	await expect(
		page.getByRole('heading', { name: 'Forgot Password' }).first(),
	).toBeVisible({ timeout: 10_000 })
})

test('visiting /endcredits (lowercase) redirects to the real End Credits screen', async ({
	page,
}) => {
	await page.goto('/endcredits')

	await expect(page).toHaveURL('/endCredits')
	await expect(page.getByPlaceholder('Search End Credits...')).toBeVisible({
		timeout: 10_000,
	})
})

test('visiting /pestcontrol (lowercase) redirects to the real Pest Control Trucks screen', async ({
	page,
}) => {
	await page.goto('/pestcontrol')

	await expect(page).toHaveURL('/pestControl')
	await expect(
		page.getByPlaceholder('Search Pest Control Trucks...'),
	).toBeVisible({ timeout: 10_000 })
})

test('visiting /aboutthedev (lowercase) redirects to the real About the Dev screen', async ({
	page,
}) => {
	await page.goto('/aboutthedev')

	await expect(page).toHaveURL('/aboutTheDev')
	await expect(page.getByText('Colter Garrison')).toBeVisible({
		timeout: 10_000,
	})
})

test('visiting a detail page with a lowercased category param (e.g. /detail/endcredits/1) still resolves — the outer route has no uppercase to redirect on, so this is handled inside the detail screen itself, not by app/+not-found.tsx', async ({
	page,
}) => {
	await page.goto('/detail/endcredits/1')

	await expect(page.getByText('Unknown category.')).toHaveCount(0)
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

test('the drawer does not show a "+not-found" link', async ({ page }) => {
	await page.goto('/')
	await page.getByLabel('Open navigation menu').click()

	await expect(page.getByRole('button', { name: '+not-found' })).toHaveCount(0)
})
