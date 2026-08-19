import { fireEvent, render, screen } from '@testing-library/react-native';
import { ColorblindModeButton } from './ColorblindModeButton';
import { useTheme } from '../hooks/useTheme';
import { LIGHT_THEME_COLORS } from '../jest/themeColorsFixture';

jest.mock('../hooks/useTheme');

describe('ColorblindModeButton', () => {
	const setColorblindMode = jest.fn();

	beforeEach(() => {
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('is closed by default and labeled "off"', () => {
		render(<ColorblindModeButton />);

		expect(
			screen.getByLabelText('Colorblind mode: off. Opens menu to turn it on.'),
		).toBeVisible();
		expect(screen.queryByText('Colorblind Mode')).toBeNull();
	});

	it('opens the menu and lists every mode, including Off', () => {
		render(<ColorblindModeButton />);

		fireEvent.press(
			screen.getByLabelText('Colorblind mode: off. Opens menu to turn it on.'),
		);

		expect(screen.getByText('Colorblind Mode')).toBeVisible();
		expect(screen.getByLabelText('Turn off colorblind mode')).toBeVisible();
		expect(
			screen.getByLabelText('Colorblind mode: Red-Green Color Blindness'),
		).toBeVisible();
		expect(
			screen.getByLabelText('Colorblind mode: Blue-Yellow Color Blindness'),
		).toBeVisible();
		expect(
			screen.getByLabelText('Colorblind mode: Achromatopsia'),
		).toBeVisible();
	});

	it('calls setColorblindMode and closes the menu when an option is chosen', () => {
		render(<ColorblindModeButton />);

		fireEvent.press(
			screen.getByLabelText('Colorblind mode: off. Opens menu to turn it on.'),
		);
		fireEvent.press(
			screen.getByLabelText('Colorblind mode: Blue-Yellow Color Blindness'),
		);

		expect(setColorblindMode).toHaveBeenCalledWith('blueYellow');
		expect(screen.queryByText('Colorblind Mode')).toBeNull();
	});

	it('closes the menu when the backdrop is pressed', () => {
		render(<ColorblindModeButton />);

		fireEvent.press(
			screen.getByLabelText('Colorblind mode: off. Opens menu to turn it on.'),
		);
		expect(screen.getByText('Colorblind Mode')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Close colorblind mode menu'));

		expect(screen.queryByText('Colorblind Mode')).toBeNull();
	});

	it('reflects an active mode in the trigger label and icon state', () => {
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'redGreen',
			setColorblindMode,
		});
		render(<ColorblindModeButton />);

		expect(
			screen.getByLabelText(
				'Colorblind mode: Red-Green Color Blindness. Opens menu to change it.',
			),
		).toBeVisible();
	});
});
