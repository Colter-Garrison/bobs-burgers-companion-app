import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	// CI shouldn't silently pass on a test someone left `.only` on.
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: 'html',

	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
	},

	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

	// Playwright's built-in mechanism for "start a server, wait until
	// it's ready, run tests against it, tear it down" — this is why we
	// don't manually run `expo export && serve dist` in a separate
	// terminal first: Playwright owns the server's lifecycle itself, so
	// `npx playwright test` is a single, correct command every time,
	// including in CI where there's no human around to start a server.
	webServer: {
		command: 'npm run build:web && npx serve dist -l 4173 -s',
		url: 'http://localhost:4173',
		// In CI, always do a full export + fresh server. Locally, reuse a
		// server that's already running on this port (e.g. from a prior
		// run) instead of re-exporting every time — much faster
		// iteration when just working on the E2E tests themselves.
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
})
