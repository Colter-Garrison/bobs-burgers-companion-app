/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,jsx,ts,tsx}'],
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
