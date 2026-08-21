import { test, expect } from '@playwright/test'

test('visiting /favorites directly while logged out redirects to /login', async ({
	page,
}) => {
	await page.goto('/favorites')

	await expect(page).toHaveURL(/\/login/)
})
