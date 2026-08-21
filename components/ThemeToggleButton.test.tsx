import { fireEvent, render, screen } from '@testing-library/react-native'
import { ThemeToggleButton } from './ThemeToggleButton'
import { useTheme } from '../hooks/useTheme'
import {
	DARK_THEME_COLORS,
	LIGHT_THEME_COLORS,
} from '../jest/themeColorsFixture'

jest.mock('../hooks/useTheme')

describe('ThemeToggleButton', () => {
	const mockToggleTheme = jest.fn()

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('shows only the sun icon (labeled "Switch to dark mode") while in light mode', () => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: mockToggleTheme,
			colors: LIGHT_THEME_COLORS,
		})

		render(<ThemeToggleButton />)

		expect(screen.getByLabelText('Switch to dark mode')).toBeVisible()
		expect(screen.queryByLabelText('Switch to light mode')).toBeNull()
	})

	it('shows only the moon icon (labeled "Switch to light mode") while in dark mode', () => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: true,
			toggleTheme: mockToggleTheme,
			colors: DARK_THEME_COLORS,
		})

		render(<ThemeToggleButton />)

		expect(screen.getByLabelText('Switch to light mode')).toBeVisible()
		expect(screen.queryByLabelText('Switch to dark mode')).toBeNull()
	})

	it('calls toggleTheme when pressed', () => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: mockToggleTheme,
			colors: LIGHT_THEME_COLORS,
		})

		render(<ThemeToggleButton />)
		fireEvent.press(screen.getByLabelText('Switch to dark mode'))

		expect(mockToggleTheme).toHaveBeenCalled()
	})
})
