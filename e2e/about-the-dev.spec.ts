import { test, expect } from '@playwright/test'

test('searching Colter Garrison on Home shows his photo and bio, and tapping him opens About the Dev', async ({
	page,
}) => {
	await page.goto('/')
	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	)
	await search.fill('Colter Garrison')

	await expect(page.getByText('Colter Garrison')).toBeVisible({
		timeout: 10_000,
	})
	await expect(
		page.getByText(/React Native developer who built this entire app/),
	).toBeVisible()

	await page.getByText('Colter Garrison').click()

	await expect(page).toHaveURL('/aboutTheDev')
	await expect(page.getByText('LinkedIn')).toBeVisible({ timeout: 10_000 })
	await expect(page.getByText('GitHub')).toBeVisible()
	await expect(page.getByText('Buy me a Coffee ☕')).toBeVisible()

	const box = await page
		.locator('div[style*="my-character-image"]')
		.boundingBox()
	expect(box?.width).toBeLessThanOrEqual(300)
	expect(box?.height).toBeLessThanOrEqual(220)
})

test('Colter Garrison can be favorited and stays favorited (regression: the backend rejects negative itemIds)', async ({
	page,
}) => {
	const username = `e2edevfav${Date.now().toString(36)}`
	const password = 'correcthorsebatterystaple'

	await page.goto('/signup')
	await page.getByPlaceholder('Username (2-25 chars)').fill(username)
	await page.getByPlaceholder('Password (min. 8 characters)').fill(password)
	await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
	await expect(page).toHaveURL('/')

	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	)
	await search.fill('Colter Garrison')
	await expect(page.getByText('Colter Garrison')).toBeVisible({
		timeout: 10_000,
	})

	await page.getByLabel('Add Colter Garrison to favorites').click()
	await expect(
		page.getByLabel('Remove Colter Garrison from favorites'),
	).toBeVisible({ timeout: 5_000 })
	await page.waitForTimeout(1_000)
	await expect(
		page.getByLabel('Remove Colter Garrison from favorites'),
	).toBeVisible()

	await page.goto('/favorites')
	await expect(page.getByText('Colter Garrison')).toBeVisible({
		timeout: 10_000,
	})

	page.once('dialog', (dialog) => void dialog.accept())
	await page.goto('/account')
	await page.getByRole('button', { name: 'Delete Account' }).click()
	await expect(page).toHaveURL('/')
})

test('Colter Garrison appears on the Characters screen and is filterable by Male / Blonde', async ({
	page,
}) => {
	await page.goto('/characters')
	await page.getByPlaceholder('Search Characters...').fill('Colter Garrison')
	await expect(page.getByText('Colter Garrison')).toBeVisible({
		timeout: 10_000,
	})

	await page.getByLabel('Show filter options').click()
	await page.getByLabel('Filter by gender: Male').click()
	await page.getByLabel('Filter by hair color: Blonde').click()

	await expect(page.getByText('Colter Garrison')).toBeVisible()
})

test('the drawer shows an About the Dev link below the categories, with no Buy Me a Beer', async ({
	page,
}) => {
	await page.goto('/')
	await page.getByLabel('Open navigation menu').click()

	const aboutTheDevLink = page.getByRole('button', { name: 'About the Dev' })
	await expect(aboutTheDevLink).toBeVisible()
	await expect(page.getByText(/Buy me a beer/)).toHaveCount(0)

	await aboutTheDevLink.click()
	await expect(page).toHaveURL('/aboutTheDev')
})
