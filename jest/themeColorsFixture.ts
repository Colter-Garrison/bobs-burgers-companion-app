// Shared across every test file that mocks useTheme — since `colors` is
// read directly (not optional-chained) by several components now that
// colorblind-mode support routes color values through it, a mock missing
// this field crashes rather than silently rendering wrong. Matches the
// app's own default (colorblindMode: 'none', light) palette.
export const LIGHT_THEME_COLORS = {
	bg: '#8FCBEA',
	surface: '#C9D9E4',
	accent: '#2C4A63',
	onAccent: '#C9D9E4',
};

export const DARK_THEME_COLORS = {
	bg: '#222222',
	surface: '#323233',
	accent: '#66D9EF',
	onAccent: '#222222',
};
