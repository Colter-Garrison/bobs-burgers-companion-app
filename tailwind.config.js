/** @type {import('tailwindcss').Config} */
module.exports = {
	// Previously only scanned `app/**`, so any Tailwind class used
	// exclusively inside components/**/*.tsx (never as a literal string
	// anywhere under app/**) silently never got generated — e.g.
	// bg-bbRed/text-bbYellow on selected filter pills rendered as
	// transparent/black instead of red/yellow, since no other file
	// happened to contain those exact class name strings.
	content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				bbYellow: '#F8DF24',
				bbRed: '#E8242F',
				bbGreen: '#BDFB73',
			},
			fontFamily: {
				chewy: ['Chewy'],
			},
		},
	},
	plugins: [],
};
