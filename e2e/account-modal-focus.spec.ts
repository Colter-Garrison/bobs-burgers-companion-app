import { test, expect } from '@playwright/test'

test('typing a full email into the Add Email modal does not lose focus between keystrokes', async ({
	page,
}) => {
	const username = `e2emodalfocus${Date.now().toString(36)}`
	const password = 'correcthorsebatterystaple'

	await page.goto('/signup')
	await page.getByPlaceholder('Username (2-25 chars)').fill(username)
	await page.getByPlaceholder('Password (min. 8 characters)').fill(password)
	await page.getByRole('button', { name: 'Sign Up', exact: true }).click()
	await expect(page).toHaveURL('/')

	await page.goto('/account')
	await page.getByRole('button', { name: 'Add Email' }).click()

	const emailField = page.getByPlaceholder('New email')
	const typedEmail = 'newbelcher@example.com'
	await emailField.pressSequentially(typedEmail, { delay: 30 })

	await expect(emailField).toHaveValue(typedEmail)

	page.once('dialog', (dialog) => void dialog.accept())
	await page.getByRole('button', { name: 'Delete Account' }).click()
	await expect(page).toHaveURL('/')
})
