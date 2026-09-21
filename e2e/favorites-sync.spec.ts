import { test, expect, Page } from '@playwright/test'

// In-app navigation (no reload), so this checks that screens share one
// favorites list live — the reload test below covers persistence.
async function openFromDrawer(page: Page, name: string) {
	await page
		.getByLabel('Open navigation menu')
		.filter({ visible: true })
		.click()
	await page.getByRole('button', { name, exact: true }).click()
}

test('favoriting/unfavoriting on one screen stays in sync with Favorites and other screens, no account needed', async ({
	page,
}) => {
	await page.goto('/characters')
	const firstNameText = page.getByTestId('card-title').first()
	await expect(firstNameText).toBeVisible({ timeout: 10_000 })
	const characterName = (await firstNameText.textContent())!

	await page
		.getByRole('button', { name: /^Add .+ to favorites$/ })
		.first()
		.click()

	await openFromDrawer(page, 'Favorites')
	await expect(page).toHaveURL('/favorites')
	await expect(page.getByRole('heading', { name: characterName })).toBeVisible()

	await page
		.getByRole('button', { name: /^Remove .+ from favorites$/ })
		.first()
		.click()
	await expect(page.getByText('No favorites yet.')).toBeVisible()

	await openFromDrawer(page, 'Characters')
	await expect(
		page.getByRole('button', { name: `Add ${characterName} to favorites` }),
	).toBeVisible({ timeout: 10_000 })
})

test('favorites survive a full page reload, and unfavoriting is saved too', async ({
	page,
}) => {
	await page.goto('/characters')
	const firstNameText = page.getByTestId('card-title').first()
	await expect(firstNameText).toBeVisible({ timeout: 10_000 })
	const characterName = (await firstNameText.textContent())!

	await page
		.getByRole('button', { name: `Add ${characterName} to favorites` })
		.click()

	await page.goto('/favorites')
	await expect(page.getByRole('heading', { name: characterName })).toBeVisible({
		timeout: 10_000,
	})

	await page.reload()
	await expect(page.getByRole('heading', { name: characterName })).toBeVisible({
		timeout: 10_000,
	})

	await page
		.getByRole('button', { name: `Remove ${characterName} from favorites` })
		.click()
	await expect(page.getByText('No favorites yet.')).toBeVisible()

	await page.reload()
	await expect(page.getByText('No favorites yet.')).toBeVisible({
		timeout: 10_000,
	})
})
