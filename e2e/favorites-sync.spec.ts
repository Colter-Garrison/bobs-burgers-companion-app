import { test, expect, Page } from '@playwright/test'

// Navigates through the drawer rather than page.goto — favorites are in
// memory only until persistent storage lands, so a reload would clear them.
// Category screens render as links in the drawer; Favorites is a button.
async function openFromDrawer(
	page: Page,
	role: 'link' | 'button',
	name: string,
) {
	await page
		.getByLabel('Open navigation menu')
		.filter({ visible: true })
		.click()
	await page.getByRole(role, { name, exact: true }).click()
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

	await openFromDrawer(page, 'button', 'Favorites')
	await expect(page).toHaveURL('/favorites')
	await expect(page.getByRole('heading', { name: characterName })).toBeVisible()

	await page
		.getByRole('button', { name: /^Remove .+ from favorites$/ })
		.first()
		.click()
	await expect(page.getByText('No favorites yet.')).toBeVisible()

	await openFromDrawer(page, 'link', 'Characters')
	await expect(
		page.getByRole('button', { name: `Add ${characterName} to favorites` }),
	).toBeVisible({ timeout: 10_000 })
})
