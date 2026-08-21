import { fireEvent, render, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { FavoriteButton } from './FavoriteButton'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { LIGHT_THEME_COLORS } from '../jest/themeColorsFixture'

jest.mock('../hooks/useAuth')
jest.mock('../hooks/useTheme')
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}))

describe('FavoriteButton', () => {
	const mockPush = jest.fn()
	const mockOnToggle = jest.fn()

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('calls onToggle when pressed while logged in', () => {
		;(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' })
		render(
			<FavoriteButton
				favorited={false}
				onToggle={mockOnToggle}
				itemName='Bob Belcher'
			/>,
		)

		fireEvent.press(screen.getByRole('button'))

		expect(mockOnToggle).toHaveBeenCalled()
		expect(mockPush).not.toHaveBeenCalled()
	})

	it('routes to /login instead of calling onToggle while logged out', () => {
		;(useAuth as jest.Mock).mockReturnValue({ token: null })
		render(
			<FavoriteButton
				favorited={false}
				onToggle={mockOnToggle}
				itemName='Bob Belcher'
			/>,
		)

		fireEvent.press(screen.getByRole('button'))

		expect(mockPush).toHaveBeenCalledWith('/login')
		expect(mockOnToggle).not.toHaveBeenCalled()
	})

	it('has an accessible label naming the item, reflecting whether it is favorited', () => {
		;(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' })
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
		;(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' })
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
