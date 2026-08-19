// Curated alternate palettes, not simulation filters — a simulation filter
// shows a non-colorblind person what a colorblind person can't see, which
// is the wrong direction for actually helping a colorblind user. These are
// real color choices, tuned to stay distinguishable for each deficiency.
//
// Originally exposed all 7 clinically-named types (protanopia,
// protanomaly, deuteranopia, deuteranomaly, tritanopia, tritanomaly,
// achromatopsia) in the picker, each mapped onto one of just 3 underlying
// palettes — protanopia/protanomaly/deuteranopia/deuteranomaly all shared
// one palette, tritanopia/tritanomaly shared another. The user found that
// repetition confusing in the actual menu and asked to collapse it down to
// the 3 real options directly, using the standard umbrella terms
// (red-green color blindness, blue-yellow color blindness, achromatopsia)
// rather than the 7 clinical subtypes.
export type ColorblindMode =
	'none' | 'redGreen' | 'blueYellow' | 'achromatopsia';

export const COLORBLIND_MODES: ColorblindMode[] = [
	'none',
	'redGreen',
	'blueYellow',
	'achromatopsia',
];

export const COLORBLIND_MODE_LABELS: Record<ColorblindMode, string> = {
	none: 'Off',
	redGreen: 'Red-Green Color Blindness',
	blueYellow: 'Blue-Yellow Color Blindness',
	achromatopsia: 'Achromatopsia',
};

interface PaletteVariant {
	bg: string;
	surface: string;
	accent: string;
	// Text/icon color for anything sitting ON an accent-filled surface
	// (e.g. a selected filter pill) — NOT general on-dark-background text.
	// Needs its own value rather than reusing `surface` or a fixed
	// off-white/dark because which one has enough contrast depends on
	// whether `accent` itself is light or dark in that specific palette.
	onAccent: string;
}

interface Palette {
	light: PaletteVariant;
	dark: PaletteVariant;
}

// The app's own shipped palette (Chambray Blue / Neon Vommit) — both are
// already blue/cyan-based with no red or green in them at all, and blue is
// one of the most reliably distinguishable hues for red-green color
// blindness. 'none' and 'redGreen' deliberately share this exact palette
// rather than a reinvented one — selecting "Red-Green Color Blindness"
// looks the same as leaving it off, which is expected, not a bug.
const RED_GREEN_SAFE: Palette = {
	light: {
		bg: '#8FCBEA',
		surface: '#C9D9E4',
		accent: '#2C4A63',
		onAccent: '#C9D9E4',
	},
	dark: {
		bg: '#222222',
		surface: '#323233',
		accent: '#66D9EF',
		onAccent: '#222222',
	},
};

// "Rabbit-Ears Rose" from the light-palette exploration — deep
// raspberry/magenta, nowhere near the blue-yellow axis tritanopia and
// tritanomaly affect.
const BLUE_YELLOW_SAFE: Palette = {
	light: {
		bg: '#F4EFE3',
		surface: '#F0CFD6',
		accent: '#7A2E45',
		onAccent: '#F0CFD6',
	},
	dark: {
		bg: '#222222',
		surface: '#323233',
		accent: '#FF66CC',
		onAccent: '#222222',
	},
};

// "Boardwalk Charcoal" from that same exploration — pure luminance-based
// grayscale. Hue is imperceptible for achromatopsia, so luminance is the
// only channel that actually matters here, and this palette already had
// the widest luminance separation of everything explored.
const ACHROMATOPSIA: Palette = {
	light: {
		bg: '#F4EFE3',
		surface: '#DCE1E5',
		accent: '#33383D',
		onAccent: '#DCE1E5',
	},
	dark: {
		bg: '#222222',
		surface: '#323233',
		accent: '#F0F0F0',
		onAccent: '#222222',
	},
};

export const COLORBLIND_PALETTES: Record<ColorblindMode, Palette> = {
	none: RED_GREEN_SAFE,
	redGreen: RED_GREEN_SAFE,
	blueYellow: BLUE_YELLOW_SAFE,
	achromatopsia: ACHROMATOPSIA,
};
