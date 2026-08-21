import { test, expect } from '@playwright/test'

test('tapping a category card opens its detail page', async ({ page }) => {
	await page.goto('/characters')
	const firstCard = page.getByTestId('card-title').first()
	await expect(firstCard).toBeVisible({ timeout: 10_000 })

	await firstCard.click()

	await expect(page).toHaveURL(/\/detail\/characters\/\d+/)
	await expect(page.getByText('View on Fandom')).toBeVisible({
		timeout: 10_000,
	})
})

test('tapping a Home search result opens its detail page', async ({ page }) => {
	await page.goto('/')
	const search = page.getByPlaceholder(
		'Search burgers, characters, episodes...',
	)
	await search.fill('bob')
	const firstResult = page.getByText(/bob/i).first()
	await expect(firstResult).toBeVisible({ timeout: 10_000 })

	await firstResult.click()

	await expect(page).toHaveURL(/\/detail\/.+\/\d+/)
})

test("a burger's detail page mentions its episode by name and links to that episode's Fandom page", async ({
	page,
}) => {
	await page.goto('/burgers')
	await page.getByTestId('card-title').first().click()
	await expect(page).toHaveURL(/\/detail\/burgers\/\d+/)

	await expect(page.getByText(/\("/)).toBeVisible({ timeout: 10_000 })
	await expect(page.getByText('View on Fandom')).toBeVisible()
})
