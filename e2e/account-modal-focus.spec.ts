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

	// Close the modal before interacting with anything underneath it — its
	// backdrop otherwise still covers the screen and intercepts clicks.
	// Escape rather than clicking the backdrop: the backdrop fills the
	// whole screen with the panel centered inside it, so Playwright's
	// default click-the-center-of-the-locator behavior lands on the
	// panel's own no-op handler, not the backdrop's onClose — a
	// test-authoring trap, not a real bug (a real user clicks somewhere
	// visibly outside the panel instead). react-native-web's Modal also
	// fades out over ~300ms and only unmounts on the animation's end
	// event, which doesn't fire reliably in a headless run, hence the
	// short fixed wait after.
	await page.keyboard.press('Escape')
	await page.waitForTimeout(400)

	page.once('dialog', (dialog) => void dialog.accept())
	await page.getByRole('button', { name: 'Delete Account' }).click()
	await expect(page).toHaveURL('/')
})
