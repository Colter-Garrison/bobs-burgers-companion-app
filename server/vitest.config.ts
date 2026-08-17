import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/**/*.test.ts'],
		// Tests here hit the real dev database over the network, not an
		// in-memory fake — Vitest's 5s default timeout is too tight for a
		// full register -> favorite -> cleanup chain under any real
		// latency.
		testTimeout: 15_000,
		hookTimeout: 15_000,
	},
});
