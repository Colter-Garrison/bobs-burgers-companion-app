import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ResetPassword from './resetPassword'
import { resetPassword } from '../../lib/apiClient'
import { useTheme } from '../../hooks/useTheme'
import { LIGHT_THEME_COLORS } from '../../jest/themeColorsFixture'

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}))
jest.mock('../../hooks/useTheme')
jest.mock('../../lib/apiClient')

describe('ResetPassword screen', () => {
	const mockPush = jest.fn()

	beforeEach(() => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
			colors: LIGHT_THEME_COLORS,
		})
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(useLocalSearchParams as jest.Mock).mockReturnValue({
			token: 'real-token',
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('submits the token from the URL with the new password and navigates to Log In on success', async () => {
		;(resetPassword as jest.Mock).mockResolvedValue(undefined)
		render(<ResetPassword />)

		fireEvent.changeText(
			screen.getByPlaceholderText('New password (min. 8 characters)'),
			'a-brand-new-password',
		)
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Reset Password' }))
		})

		expect(resetPassword).toHaveBeenCalledWith(
			'real-token',
			'a-brand-new-password',
		)
		expect(mockPush).toHaveBeenCalledWith('/login')
	})

	it('shows an error message and does not navigate on failure', async () => {
		;(resetPassword as jest.Mock).mockRejectedValue(
			new Error('Invalid or expired reset link'),
		)
		render(<ResetPassword />)

		fireEvent.changeText(
			screen.getByPlaceholderText('New password (min. 8 characters)'),
			'a-brand-new-password',
		)
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Reset Password' }))
		})

		expect(screen.getByText('Invalid or expired reset link')).toBeVisible()
		expect(mockPush).not.toHaveBeenCalled()
	})

	it('disables the submit button when there is no token in the URL', () => {
		;(useLocalSearchParams as jest.Mock).mockReturnValue({})
		render(<ResetPassword />)

		expect(
			screen.getByRole('button', { name: 'Reset Password' }),
		).toBeDisabled()
	})
})
