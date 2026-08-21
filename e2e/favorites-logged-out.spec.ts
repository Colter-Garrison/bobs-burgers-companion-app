import { test, expect } from '@playwright/test'

test('tapping a favorite star while logged out routes to the login screen', async ({
	page,
}) => {
	await page.goto('/burgers')

	await expect(page.getByLabel(/^Add .+ to favorites$/).first()).toBeVisible({
		timeout: 10_000,
	})

	await page
		.getByLabel(/^Add .+ to favorites$/)
		.first()
		.click()

	await expect(page).toHaveURL(/\/login/)
})
