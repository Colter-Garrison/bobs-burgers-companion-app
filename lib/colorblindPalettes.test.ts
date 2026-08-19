import {
	COLORBLIND_MODES,
	COLORBLIND_MODE_LABELS,
	COLORBLIND_PALETTES,
} from './colorblindPalettes';

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

describe('colorblindPalettes', () => {
	it('has a label for every mode', () => {
		for (const mode of COLORBLIND_MODES) {
			expect(COLORBLIND_MODE_LABELS[mode]).toEqual(expect.any(String));
		}
	});

	it('has a complete light and dark palette for every mode', () => {
		for (const mode of COLORBLIND_MODES) {
			const palette = COLORBLIND_PALETTES[mode];
			for (const variant of [palette.light, palette.dark]) {
				expect(variant.bg).toMatch(HEX_PATTERN);
				expect(variant.surface).toMatch(HEX_PATTERN);
				expect(variant.accent).toMatch(HEX_PATTERN);
				expect(variant.onAccent).toMatch(HEX_PATTERN);
			}
		}
	});

	it('has exactly 4 modes (off + the 3 real palettes)', () => {
		expect(COLORBLIND_MODES).toEqual([
			'none',
			'redGreen',
			'blueYellow',
			'achromatopsia',
		]);
	});

	it('deliberately gives "none" and "redGreen" the same palette — the app is already blue-based, so leaving colorblind mode off looks identical to picking Red-Green Color Blindness', () => {
		expect(COLORBLIND_PALETTES.none).toBe(COLORBLIND_PALETTES.redGreen);
	});

	it('gives blueYellow and achromatopsia each their own distinct palette', () => {
		const uniquePalettes = new Set(
			COLORBLIND_MODES.map((mode) => COLORBLIND_PALETTES[mode]),
		);
		expect(uniquePalettes.size).toBe(3);
	});
});
