import { Alert, Platform } from 'react-native'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import Account from './account'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { LIGHT_THEME_COLORS } from '../../jest/themeColorsFixture'

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}))
jest.mock('../../hooks/useAuth')
jest.mock('../../hooks/useTheme')
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		callback()
	},
}))

describe('Account screen', () => {
	const mockPush = jest.fn()
	const mockDeleteAccount = jest.fn()
	const mockRefreshProfile = jest.fn()
	const mockUpdateUsername = jest.fn()
	const mockUpdatePassword = jest.fn()
	const mockUpdateEmail = jest.fn()

	function mockAuth(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
		;(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			username: 'bobbelcher',
			email: null,
			emailVerified: false,
			loading: false,
			deleteAccount: mockDeleteAccount,
			refreshProfile: mockRefreshProfile,
			updateUsername: mockUpdateUsername,
			updatePassword: mockUpdatePassword,
			updateEmail: mockUpdateEmail,
			...overrides,
		})
	}

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
			colors: LIGHT_THEME_COLORS,
		})
		mockAuth()
	})

	afterEach(() => {
		jest.clearAllMocks()
		jest.restoreAllMocks()
	})

	it('shows the logged-in username', () => {
		render(<Account />)
		expect(screen.getByText('bobbelcher')).toBeVisible()
	})

	it('redirects to /login when there is no token and loading has settled', () => {
		mockAuth({ token: null, username: null })

		render(<Account />)

		expect(mockPush).toHaveBeenCalledWith('/login')
	})

	it('does not redirect while the session is still being restored', () => {
		mockAuth({ token: null, username: null, loading: true })

		render(<Account />)

		expect(mockPush).not.toHaveBeenCalled()
	})

	describe('email status and gating', () => {
		it('shows "No email on file" and disables Change Username/Password when there is none', () => {
			render(<Account />)

			expect(screen.getByText('No email on file')).toBeVisible()
			expect(
				screen.getByRole('button', { name: 'Change Username' }),
			).toBeDisabled()
			expect(
				screen.getByRole('button', { name: 'Change Password' }),
			).toBeDisabled()
			expect(
				screen.getByText(
					'Verify an email to unlock username and password changes',
				),
			).toBeVisible()
			expect(screen.getByRole('button', { name: 'Add Email' })).toBeVisible()
		})

		it('shows the pending-verification message when an email is set but unverified', () => {
			mockAuth({ email: 'bob@example.com', emailVerified: false })

			render(<Account />)

			expect(
				screen.getByText(
					'Verification email sent to bob@example.com — check your inbox',
				),
			).toBeVisible()
			expect(
				screen.getByRole('button', { name: 'Change Username' }),
			).toBeDisabled()
		})

		it('shows the email as verified and enables Change Username/Password once verified', () => {
			mockAuth({ email: 'bob@example.com', emailVerified: true })

			render(<Account />)

			expect(screen.getByText('bob@example.com (verified)')).toBeVisible()
			expect(
				screen.getByRole('button', { name: 'Change Username' }),
			).not.toBeDisabled()
			expect(
				screen.getByRole('button', { name: 'Change Password' }),
			).not.toBeDisabled()
			expect(
				screen.queryByText(
					'Verify an email to unlock username and password changes',
				),
			).toBeNull()
			expect(screen.getByRole('button', { name: 'Change Email' })).toBeVisible()
		})

		it('refreshes the profile on focus', () => {
			render(<Account />)
			expect(mockRefreshProfile).toHaveBeenCalled()
		})
	})

	describe('Change Username modal', () => {
		it('is not opened by pressing the button while disabled', () => {
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Change Username' }))

			expect(screen.queryByPlaceholderText('Old username')).toBeNull()
		})

		it('submits oldUsername/newUsername and closes on success', async () => {
			mockAuth({ email: 'bob@example.com', emailVerified: true })
			mockUpdateUsername.mockResolvedValue(undefined)
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Change Username' }))
			fireEvent.changeText(
				screen.getByPlaceholderText('Old username'),
				'bobbelcher',
			)
			fireEvent.changeText(
				screen.getByPlaceholderText('New username'),
				'newbelcher',
			)
			await act(async () => {
				fireEvent.press(screen.getByText('Save'))
			})

			expect(mockUpdateUsername).toHaveBeenCalledWith(
				'bobbelcher',
				'newbelcher',
			)
			expect(screen.queryByPlaceholderText('Old username')).toBeNull()
		})

		it('shows an error and keeps the modal open on failure', async () => {
			mockAuth({ email: 'bob@example.com', emailVerified: true })
			mockUpdateUsername.mockRejectedValue(
				new Error('That doesn’t match your current username'),
			)
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Change Username' }))
			fireEvent.changeText(screen.getByPlaceholderText('Old username'), 'wrong')
			fireEvent.changeText(
				screen.getByPlaceholderText('New username'),
				'newbelcher',
			)
			await act(async () => {
				fireEvent.press(screen.getByText('Save'))
			})

			expect(
				screen.getByText('That doesn’t match your current username'),
			).toBeVisible()
			expect(screen.getByPlaceholderText('Old username')).toBeVisible()
		})
	})

	describe('Change Password modal', () => {
		it('rejects a mismatched confirm-password client-side, without calling updatePassword', async () => {
			mockAuth({ email: 'bob@example.com', emailVerified: true })
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Change Password' }))
			fireEvent.changeText(
				screen.getByPlaceholderText('Old password'),
				'old-pass',
			)
			fireEvent.changeText(
				screen.getByPlaceholderText('New password'),
				'new-pass-1',
			)
			fireEvent.changeText(
				screen.getByPlaceholderText('Verify new password'),
				'new-pass-2',
			)
			await act(async () => {
				fireEvent.press(screen.getByText('Save'))
			})

			expect(screen.getByText('New passwords do not match')).toBeVisible()
			expect(mockUpdatePassword).not.toHaveBeenCalled()
		})

		it('submits oldPassword/newPassword and closes on success when they match', async () => {
			mockAuth({ email: 'bob@example.com', emailVerified: true })
			mockUpdatePassword.mockResolvedValue(undefined)
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Change Password' }))
			fireEvent.changeText(
				screen.getByPlaceholderText('Old password'),
				'old-pass',
			)
			fireEvent.changeText(
				screen.getByPlaceholderText('New password'),
				'new-pass',
			)
			fireEvent.changeText(
				screen.getByPlaceholderText('Verify new password'),
				'new-pass',
			)
			await act(async () => {
				fireEvent.press(screen.getByText('Save'))
			})

			expect(mockUpdatePassword).toHaveBeenCalledWith('old-pass', 'new-pass')
			expect(screen.queryByPlaceholderText('Old password')).toBeNull()
		})
	})

	describe('Add/Change Email modal', () => {
		it('Add Email: only shows a single new-email field and submits with no oldEmail', async () => {
			mockUpdateEmail.mockResolvedValue(undefined)
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Add Email' }))

			expect(screen.queryByPlaceholderText('Old email')).toBeNull()
			fireEvent.changeText(
				screen.getByPlaceholderText('New email'),
				'new@example.com',
			)
			await act(async () => {
				fireEvent.press(screen.getByText('Save'))
			})

			expect(mockUpdateEmail).toHaveBeenCalledWith('new@example.com', undefined)
		})

		it('Change Email: shows both fields and submits oldEmail/newEmail', async () => {
			mockAuth({ email: 'bob@example.com', emailVerified: true })
			mockUpdateEmail.mockResolvedValue(undefined)
			render(<Account />)

			fireEvent.press(screen.getByRole('button', { name: 'Change Email' }))
			fireEvent.changeText(
				screen.getByPlaceholderText('Old email'),
				'bob@example.com',
			)
			fireEvent.changeText(
				screen.getByPlaceholderText('New email'),
				'newbob@example.com',
			)
			await act(async () => {
				fireEvent.press(screen.getByText('Save'))
			})

			expect(mockUpdateEmail).toHaveBeenCalledWith(
				'newbob@example.com',
				'bob@example.com',
			)
		})
	})

	describe('on native platforms', () => {
		beforeEach(() => {
			Platform.OS = 'ios'
		})

		it('deletes the account when the native confirm alert is accepted', async () => {
			mockDeleteAccount.mockResolvedValue(undefined)
			jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
				const deleteButton = buttons?.find((b) => b.text === 'Delete')
				deleteButton?.onPress?.()
			})
			render(<Account />)

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }))
			})

			expect(mockDeleteAccount).toHaveBeenCalled()
			expect(mockPush).toHaveBeenCalledWith('/')
		})

		it('does not delete when the native confirm alert is cancelled', async () => {
			jest.spyOn(Alert, 'alert').mockImplementation(() => {
				// Simulates the user tapping "Cancel" — no callback invoked.
			})
			render(<Account />)

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }))
			})

			expect(mockDeleteAccount).not.toHaveBeenCalled()
		})
	})

	describe('on web', () => {
		const mockConfirm = jest.fn()

		beforeEach(() => {
			Platform.OS = 'web'
			global.window = {
				confirm: mockConfirm,
			} as unknown as Window & typeof globalThis
		})

		afterEach(() => {
			Platform.OS = 'ios'
			delete (global as { window?: Window }).window
		})

		it('deletes the account when window.confirm is accepted', async () => {
			mockConfirm.mockReturnValue(true)
			mockDeleteAccount.mockResolvedValue(undefined)
			render(<Account />)

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }))
			})

			expect(mockDeleteAccount).toHaveBeenCalled()
			expect(mockPush).toHaveBeenCalledWith('/')
		})

		it('does not delete when window.confirm is declined', async () => {
			mockConfirm.mockReturnValue(false)
			render(<Account />)

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }))
			})

			expect(mockDeleteAccount).not.toHaveBeenCalled()
		})
	})

	it('shows an error message when deleting fails', async () => {
		Platform.OS = 'web'
		global.window = {
			confirm: jest.fn().mockReturnValue(true),
		} as unknown as Window & typeof globalThis
		mockDeleteAccount.mockRejectedValue(new Error('Server error'))
		render(<Account />)

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }))
		})

		expect(screen.getByText('Server error')).toBeVisible()
		expect(mockPush).not.toHaveBeenCalledWith('/')

		Platform.OS = 'ios'
		delete (global as { window?: Window }).window
	})
})
