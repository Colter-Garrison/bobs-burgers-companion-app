/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				lightBg: 'var(--light-bg, #8FCBEA)',
				lightSurface: 'var(--light-surface, #C9D9E4)',
				lightAccent: 'var(--light-accent, #2C4A63)',
				darkBg: 'var(--dark-bg, #222222)',
				darkSurface: 'var(--dark-surface, #323233)',
				darkAccent: 'var(--dark-accent, #66D9EF)',
				darkOnAccent: 'var(--dark-on-accent, #222222)',
				darkHeader: '#3C3C3C',
			},
			fontFamily: {
				chewy: ['Chewy'],
			},
		},
	},
	plugins: [],
}
