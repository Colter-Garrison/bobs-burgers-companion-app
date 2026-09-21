import { fireEvent, render, screen } from '@testing-library/react-native'
import { FavoriteButton } from './FavoriteButton'
import { useTheme } from '../hooks/useTheme'
import { LIGHT_THEME_COLORS } from '../jest/themeColorsFixture'

jest.mock('../hooks/useTheme')

describe('FavoriteButton', () => {
	const mockOnToggle = jest.fn()

	beforeEach(() => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('calls onToggle when pressed', () => {
		render(
			<FavoriteButton
				favorited={false}
				onToggle={mockOnToggle}
				itemName='Bob Belcher'
			/>,
		)

		fireEvent.press(screen.getByRole('button'))

		expect(mockOnToggle).toHaveBeenCalled()
	})

	it('has an accessible label naming the item, reflecting whether it is favorited', () => {
		const { rerender } = render(
			<FavoriteButton
				favorited={false}
				onToggle={mockOnToggle}
				itemName='Bob Belcher'
			/>,
		)
		expect(screen.getByLabelText('Add Bob Belcher to favorites')).toBeVisible()

		rerender(
			<FavoriteButton
				favorited={true}
				onToggle={mockOnToggle}
				itemName='Bob Belcher'
			/>,
		)
		expect(
			screen.getByLabelText('Remove Bob Belcher from favorites'),
		).toBeVisible()
	})

	it('still renders (and stays pressable) when a colorblind mode is active in dark mode', () => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: true,
			colors: { bg: '#222222', surface: '#323233', accent: '#7A2E45' },
			colorblindMode: 'blueYellow',
		})
		render(
			<FavoriteButton
				favorited={false}
				onToggle={mockOnToggle}
				itemName='Bob Belcher'
			/>,
		)

		fireEvent.press(screen.getByRole('button'))

		expect(mockOnToggle).toHaveBeenCalled()
	})
})
