// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config')
const globals = require('globals')
const expoConfig = require('eslint-config-expo/flat')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const reactNativeA11y = require('eslint-plugin-react-native-a11y')

module.exports = defineConfig([
	globalIgnores([
		'dist/',
		'web-build/',
		'.expo/',
		'playwright-report/',
		'test-results/',
		'expo-env.d.ts',
	]),
	expoConfig,
	prettierRecommended,
	// eslint-plugin-jsx-a11y (the usual React accessibility lint plugin)
	// was considered first, but its rules key off React DOM's own
	// vocabulary — lowercase tag names (img, a, input) and web ARIA props
	// (role, alt, aria-label) — none of which this app's JSX ever uses
	// (React Native components are PascalCase, and accessibility is
	// expressed via accessibilityRole/accessibilityLabel/etc instead).
	// Installed as-is, jsx-a11y would never actually fire here.
	// eslint-plugin-react-native-a11y is the RN-native equivalent, built
	// around that same accessibility* prop vocabulary. It only ships
	// legacy (.eslintrc) presets, so its 'all' preset's rules are
	// registered by hand here.
	{
		plugins: { 'react-native-a11y': reactNativeA11y },
		rules: {
			...reactNativeA11y.configs.all.rules,
			// Demands an accessibilityHint on every element that has an
			// accessibilityLabel, with no way to tell it a label is already
			// self-explanatory. Apple's own accessibility guidance is explicit
			// that a hint should only be added when it says something the
			// label doesn't — a hint that just restates "Add Bob Belcher to
			// favorites" as "Adds this character to your favorites" is pure
			// noise a screen reader user has to sit through on every single
			// control. Enforcing this rule as-is would push toward writing 30+
			// redundant hints just to satisfy the linter, which actively hurts
			// the a11y this whole plugin exists to help.
			'react-native-a11y/has-accessibility-hint': 'off',
		},
	},
	{
		files: ['jest/**/*.js'],
		languageOptions: { globals: globals.jest },
	},
	{
		files: [
			'metro.config.js',
			'babel.config.js',
			'tailwind.config.js',
			'jest.config.js',
			'eslint.config.js',
			'playwright.config.ts',
		],
		languageOptions: { globals: globals.node },
	},
])
