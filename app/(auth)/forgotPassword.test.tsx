import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import ForgotPassword from './forgotPassword'
import { requestPasswordReset } from '../../lib/apiClient'
import { useTheme } from '../../hooks/useTheme'
import { LIGHT_THEME_COLORS } from '../../jest/themeColorsFixture'

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}))
jest.mock('../../hooks/useTheme')
jest.mock('../../lib/apiClient')

let focusEffectCleanup: (() => void) | undefined
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		focusEffectCleanup = callback() ?? undefined
	},
}))

describe('ForgotPassword screen', () => {
	const mockPush = jest.fn()

	beforeEach(() => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
			colors: LIGHT_THEME_COLORS,
		})
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('submits the email and shows the generic response message', async () => {
		;(requestPasswordReset as jest.Mock).mockResolvedValue({
			message: 'If an account with that email exists, we’ve sent it.',
		})
		render(<ForgotPassword />)

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'bob@example.com',
		)
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Send' }))
		})

		expect(requestPasswordReset).toHaveBeenCalledWith('bob@example.com')
		expect(
			screen.getByText('If an account with that email exists, we’ve sent it.'),
		).toBeVisible()
	})

	it('shows an error message on failure', async () => {
		;(requestPasswordReset as jest.Mock).mockRejectedValue(
			new Error('Invalid email address'),
		)
		render(<ForgotPassword />)

		fireEvent.changeText(screen.getByPlaceholderText('Email'), 'not-an-email')
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Send' }))
		})

		expect(screen.getByText('Invalid email address')).toBeVisible()
	})

	it('navigates back to Log In when the link is pressed', () => {
		render(<ForgotPassword />)

		fireEvent.press(screen.getByText('Back to Log In'))

		expect(mockPush).toHaveBeenCalledWith('/login')
	})

	it('clears the email/message/error when the screen loses focus', () => {
		render(<ForgotPassword />)

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'bob@example.com',
		)

		act(() => {
			focusEffectCleanup?.()
		})

		expect(screen.getByPlaceholderText('Email').props.value).toBe('')
	})
})
