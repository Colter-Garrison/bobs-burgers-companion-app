import {
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import VerifyEmail from './verifyEmail'
import { verifyEmail } from '../lib/apiClient'
import { useAuth } from '../hooks/useAuth'

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}))
jest.mock('../lib/apiClient')
jest.mock('../hooks/useAuth')

describe('VerifyEmail screen', () => {
	const mockPush = jest.fn()
	const mockRefreshProfile = jest.fn()

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(useLocalSearchParams as jest.Mock).mockReturnValue({
			token: 'real-token',
		})
		;(useAuth as jest.Mock).mockReturnValue({
			token: null,
			refreshProfile: mockRefreshProfile,
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('verifies the token from the URL on mount and shows success', async () => {
		;(verifyEmail as jest.Mock).mockResolvedValue({ verified: true })
		render(<VerifyEmail />)

		await waitFor(() =>
			expect(screen.getByText('Your email is verified!')).toBeVisible(),
		)
		expect(verifyEmail).toHaveBeenCalledWith('real-token')
	})

	it('refreshes the local session profile when logged in', async () => {
		;(useAuth as jest.Mock).mockReturnValue({
			token: 'active-session-token',
			refreshProfile: mockRefreshProfile,
		})
		;(verifyEmail as jest.Mock).mockResolvedValue({ verified: true })
		render(<VerifyEmail />)

		await waitFor(() => expect(mockRefreshProfile).toHaveBeenCalled())
	})

	it('does not refresh the profile when there is no active session', async () => {
		;(verifyEmail as jest.Mock).mockResolvedValue({ verified: true })
		render(<VerifyEmail />)

		await waitFor(() =>
			expect(screen.getByText('Your email is verified!')).toBeVisible(),
		)
		expect(mockRefreshProfile).not.toHaveBeenCalled()
	})

	it('shows an error message when the token is invalid or expired', async () => {
		;(verifyEmail as jest.Mock).mockRejectedValue(
			new Error('Invalid or expired verification link'),
		)
		render(<VerifyEmail />)

		await waitFor(() =>
			expect(
				screen.getByText('Invalid or expired verification link'),
			).toBeVisible(),
		)
	})

	it('shows an error immediately when there is no token in the URL', async () => {
		;(useLocalSearchParams as jest.Mock).mockReturnValue({})
		render(<VerifyEmail />)

		await waitFor(() =>
			expect(
				screen.getByText('This link is missing a verification token.'),
			).toBeVisible(),
		)
		expect(verifyEmail).not.toHaveBeenCalled()
	})

	it('navigates to Account when the link is pressed', async () => {
		;(verifyEmail as jest.Mock).mockResolvedValue({ verified: true })
		render(<VerifyEmail />)
		await waitFor(() =>
			expect(screen.getByText('Your email is verified!')).toBeVisible(),
		)

		fireEvent.press(screen.getByText('Back to Account'))

		expect(mockPush).toHaveBeenCalledWith('/account')
	})
})
