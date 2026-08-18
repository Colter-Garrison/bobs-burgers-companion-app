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
				// Dark mode palette — pulled from the user's own VS Code
				// theme (Neon Vommit: ghgofort.neon-vommit) rather than a
				// dimmed rendition of the light theme's hues, per their
				// explicit request. darkBg/darkSurface are the theme's
				// own neutral grays (card lighter than the screen behind
				// it, so it pops, matching normal dark-theme elevation
				// convention). darkAccent is the theme's most-used syntax
				// color (cyan, used for variables) — chosen by the user
				// over the theme's other accent options (neon green,
				// magenta). darkOnAccent is NOT general dark-mode text —
				// its only consumer is text/icons sitting on top of a
				// darkAccent-filled surface (e.g. a selected filter
				// pill). Cyan is a light color (luminance close to
				// bbYellow's), so unlike the old darkRed, off-white text
				// on it is unreadable (~1.45:1 contrast) — this has to
				// be dark instead (~9.6:1).
				darkBg: '#222222',
				darkSurface: '#323233',
				darkAccent: '#66D9EF',
				darkOnAccent: '#222222',
				darkHeader: '#3C3C3C',
			},
			fontFamily: {
				chewy: ['Chewy'],
			},
		},
	},
	plugins: [],
};
