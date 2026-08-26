import { test, expect } from '@playwright/test'

test('drawer link navigates to the category screen and back', async ({
	page,
}) => {
	await page.goto('/')

	await page.getByLabel('Open navigation menu').click()
	await page.getByRole('link', { name: 'Burgers of the Day' }).click()
	await expect(page).toHaveURL(/\/burgers/)

	await expect(page.getByLabel(/^Add .+ to favorites$/).first()).toBeVisible({
		timeout: 10_000,
	})

	await page.goBack()
	await expect(page).toHaveURL('/')
	await expect(
		page.getByPlaceholder('Search burgers, characters, episodes...'),
	).toBeVisible()
})

test('a direct link to a category screen works (not just in-app navigation)', async ({
	page,
}) => {
	await page.goto('/characters')

	await expect(page.getByLabel(/^Add .+ to favorites$/).first()).toBeVisible({
		timeout: 10_000,
	})
})

test('repeatedly opening the drawer, visiting a category, and hitting back never escapes the app (regression: React Navigation Drawer tracks its own open/closed state as browser history, and closing it as a side effect of navigating used to erode real history until back skipped past Home to whatever page came before the app)', async ({
	page,
}) => {
	await page.goto('/')

	for (let i = 0; i < 5; i++) {
		await page.getByLabel('Open navigation menu').first().click()
		await page
			.getByRole('link', { name: 'Characters', exact: true })
			.first()
			.click()
		await expect(page).toHaveURL(/\/characters/)

		await page.goBack()
		await expect(page).toHaveURL('/')
		await expect(
			page.getByPlaceholder('Search burgers, characters, episodes...'),
		).toBeVisible()
	}
})
