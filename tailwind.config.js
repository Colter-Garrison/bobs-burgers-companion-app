/** @type {import('tailwindcss').Config} */
module.exports = {
	// Previously only scanned `app/**`, so any Tailwind class used
	// exclusively inside components/**/*.tsx (never as a literal string
	// anywhere under app/**) silently never got generated — e.g.
	// bg-lightAccent/text-lightSurface on selected filter pills rendered
	// as transparent/black instead of navy/chambray, since no other file
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
				// Light mode palette — "Chambray Blue," picked after the
				// user rejected the original bbYellow/bbRed/bbGreen
				// screengrab colors (yellow specifically, and the red
				// didn't clear body-text contrast either) and reviewed
				// several alternatives pulled from the app's own splash
				// screen and from Bob's own on-screen wardrobe. Renamed
				// from bbYellow/bbRed/bbGreen to role-based names —
				// matching the dark palette's own darkBg/darkSurface/
				// darkAccent naming — since keeping the old names would
				// leave "bbYellow" holding a blue value, which is exactly
				// the kind of landmine the dark-palette rename upstream
				// of this one was already trying to avoid. Unlike dark
				// mode's darkAccent (cyan, too light for light text),
				// lightAccent's navy is dark enough that lightSurface
				// pulls double duty as both the card background AND the
				// selected-pill text color — no separate "onAccent" token
				// needed here. lightBg went through one more revision
				// after the initial parchment cream shipped — the user
				// found it "boring"/too close to plain white, and asked
				// for a real color instead. #8FCBEA is the splash
				// screen's own sky blue at (deliberately) a richer/more
				// saturated value than lightSurface, so cards read as
				// lighter "clouds" floating on the sky behind them,
				// rather than nearly blending into a lighter background.
				lightBg: '#8FCBEA',
				lightSurface: '#C9D9E4',
				lightAccent: '#2C4A63',
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
				// lightSurface's), so unlike lightAccent, off-white text
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
