/** @type {import('jest').Config} */
module.exports = {
	preset: 'jest-expo',

	// app/_layout.tsx does `import '../global.css'` — a bare CSS import
	// that NativeWind's build pipeline understands, but Jest doesn't
	// (Metro, the real bundler, is what actually resolves .css files;
	// Jest never runs Metro). Map any .css import to an empty stub module
	// instead of letting Jest fail to resolve it.
	moduleNameMapper: {
		'\\.css$': '<rootDir>/jest/cssStub.js',
	},

	// Jest's default testMatch recursively scans the whole repo for any
	// *.test.ts(x) or *.spec.ts(x) file by filename alone — it has no
	// idea e2e/ is Playwright's territory or that server/ is a
	// completely separate project with its own Vitest test runner.
	// Without this, Jest would try to *execute* those files itself and
	// fail on missing/mismatched globals (`test`/`expect` imported from
	// '@playwright/test' or 'vitest', not Jest's own).
	testPathIgnorePatterns: [
		'/node_modules/',
		'<rootDir>/e2e/',
		'<rootDir>/server/',
	],
};
