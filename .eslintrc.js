// https://docs.expo.dev/guides/using-eslint/
module.exports = {
	extends: ['expo', 'plugin:prettier/recommended'],
	overrides: [
		{
			files: [
				'metro.config.js',
				'babel.config.js',
				'tailwind.config.js',
				'jest.config.js',
				'playwright.config.ts',
			],
			env: { node: true },
		},
	],
};
