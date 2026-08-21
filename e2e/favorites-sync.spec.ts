import { test, expect } from '@playwright/test'

test('favoriting/unfavoriting on one screen stays in sync with Favorites and other screens', async ({
	page,
}) => {
	const username = `e2efavsync${Date.now().toString(36)}`
	const password = 'correcthorsebatterystaple'

	await page.goto('/signup')
	await page.getByPlaceholder('Username (2-25 chars)').fill(username)
	await page.getByPlaceholder('Password (min. 8 characters)').fill(password)
	await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
	await expect(page).toHaveURL('/')

	await page.goto('/characters')
	const firstNameText = page.getByTestId('card-title').first()
	await expect(firstNameText).toBeVisible({ timeout: 10_000 })
	const characterName = (await firstNameText.textContent())!

	await page
		.getByRole('button', { name: /^Add .+ to favorites$/ })
		.first()
		.click()
	await page.goto('/favorites')
	await expect(page.getByText(characterName)).toBeVisible()

	await page
		.getByRole('button', { name: /^Remove .+ from favorites$/ })
		.first()
		.click()
	await expect(page.getByText('No favorites yet.')).toBeVisible()

	await page.goto('/characters')
	await expect(
		page.getByRole('button', { name: /^Add .+ to favorites$/ }).first(),
	).toBeVisible({ timeout: 10_000 })

	await page
		.getByRole('button', { name: /^Add .+ to favorites$/ })
		.first()
		.click()
	await page.goto('/favorites')
	await expect(page.getByText(characterName)).toBeVisible()

	page.once('dialog', (dialog) => void dialog.accept())
	await page.goto('/account')
	await page.getByRole('button', { name: 'Delete Account' }).click()
	await expect(page).toHaveURL('/')
})
