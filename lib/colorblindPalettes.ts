export type ColorblindMode =
	'none' | 'redGreen' | 'blueYellow' | 'achromatopsia'

export const COLORBLIND_MODES: ColorblindMode[] = [
	'none',
	'redGreen',
	'blueYellow',
	'achromatopsia',
]

export const COLORBLIND_MODE_LABELS: Record<ColorblindMode, string> = {
	none: 'Off',
	redGreen: 'Red-Green Color Blindness',
	blueYellow: 'Blue-Yellow Color Blindness',
	achromatopsia: 'Achromatopsia',
}

interface PaletteVariant {
	bg: string
	surface: string
	accent: string
	onAccent: string
}

interface Palette {
	light: PaletteVariant
	dark: PaletteVariant
}

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
}

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
}

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
}

export const COLORBLIND_PALETTES: Record<ColorblindMode, Palette> = {
	none: RED_GREEN_SAFE,
	redGreen: RED_GREEN_SAFE,
	blueYellow: BLUE_YELLOW_SAFE,
	achromatopsia: ACHROMATOPSIA,
}
