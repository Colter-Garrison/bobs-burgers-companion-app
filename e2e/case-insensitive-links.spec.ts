import { test, expect } from '@playwright/test'

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
