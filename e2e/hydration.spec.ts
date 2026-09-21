import { test, expect } from '@playwright/test'

// Every URL here is pre-rendered to HTML by the static export, and the
// browser has to render exactly the same thing on its first pass. When it
// doesn't, React 19 reports it as an uncaught page error (#418 in
// production builds), not a console message — so listen to both.
const HYDRATION_ERROR = /Hydration failed|Minified React error #4(18|19|23)/

const URLS = [
	'/',
	'/burgers',
	'/characters',
	'/endcredits',
	'/episodes',
	'/pestcontrol',
	'/stores',
	'/favorites',
	'/aboutthedev',
	'/detail/episodes/3',
	'/detail/characters/1',
	'/this-route-does-not-exist',
]

for (const url of URLS) {
	test(`${url} hydrates without a mismatch`, async ({ page }) => {
		const errors: string[] = []
		page.on('pageerror', (error) => errors.push(error.message))
		page.on('console', (message) => {
			if (message.type() === 'error') errors.push(message.text())
		})

		await page.goto(url)
		await page.getByLabel('Open navigation menu').first().waitFor()
		// Give hydration and the first round of effects time to finish.
		await page.waitForTimeout(1_500)

		expect(errors.filter((error) => HYDRATION_ERROR.test(error))).toEqual([])
	})
}
