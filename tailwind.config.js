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
	// 'class' (rather than the default 'media') is required for
	// nativewind's colorScheme.set()/setColorScheme() to work at all —
	// with 'media' it can only ever follow the OS setting and throws if
	// you try to override it manually. See hooks/useTheme.tsx for the
	// system-default-on-first-launch + manual-override-persisted logic
	// this enables.
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				bbYellow: '#F8DF24',
				bbRed: '#E8242F',
				bbGreen: '#BDFB73',
				// Dark mode palette — a dimmed rendition of the light
				// theme's own hues (bbGreen/bbYellow/bbRed), not neutral
				// Material-style grays. darkBg/darkSurface are the same
				// green/yellow hues at a fraction of their light-mode
				// brightness (darkSurface dimmed noticeably less than
				// darkBg, deliberately — the two source colors are
				// already close in raw lightness, so an equal dimming
				// factor made cards nearly disappear into the
				// background; borders alone weren't enough separation).
				// darkRed/darkText stay close to their light-mode
				// brightness on purpose — dimming text/accent color by
				// the same factor as the backgrounds crushes contrast
				// (red is a low-luminance hue to begin with), so those
				// two keep doing the "readable on dark" job the neutral
				// palette's red/off-white already did well.
				darkBg: '#13190C',
				darkSurface: '#373108',
				darkRed: '#F2545B',
				darkText: '#ECEDEE',
				darkHeader: '#252E42',
			},
			fontFamily: {
				chewy: ['Chewy'],
			},
		},
	},
	plugins: [],
};
