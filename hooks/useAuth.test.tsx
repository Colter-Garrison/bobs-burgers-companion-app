import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import { AuthProvider, useAuth } from './useAuth'
import {
	deleteAccountRequest,
	fetchProfile,
	loginUser,
	registerUser,
	updateEmailRequest,
	updatePasswordRequest,
	updateUsernameRequest,
} from '../lib/apiClient'
import { tokenStorage } from '../lib/tokenStorage'

jest.mock('../lib/apiClient')
jest.mock('../lib/tokenStorage')

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<AuthProvider>{children}</AuthProvider>
)

describe('useAuth', () => {
	beforeEach(() => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue(null)
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue(null)
		;(tokenStorage.save as jest.Mock).mockResolvedValue(undefined)
		;(tokenStorage.clear as jest.Mock).mockResolvedValue(undefined)
		;(fetchProfile as jest.Mock).mockResolvedValue({
			username: 'bobbelcher',
			email: null,
			emailVerifiedAt: null,
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('starts loading, then restores no session when storage is empty', async () => {
		const { result } = renderHook(() => useAuth(), { wrapper })

		expect(result.current.loading).toBe(true)

		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.token).toBeNull()
		expect(result.current.username).toBeNull()
	})

	it('restores a persisted session on mount', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')

		const { result } = renderHook(() => useAuth(), { wrapper })

		await waitFor(() => expect(result.current.loading).toBe(false))

		expect(result.current.token).toBe('stored-token')
		expect(result.current.username).toBe('bobbelcher')
	})

	it('login persists the token/username and updates state on success', async () => {
		;(loginUser as jest.Mock).mockResolvedValue({ token: 'new-token' })
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.login('bobbelcher', 'correcthorse')
		})

		expect(loginUser).toHaveBeenCalledWith('bobbelcher', 'correcthorse')
		expect(tokenStorage.save).toHaveBeenCalledWith('new-token', 'bobbelcher')
		expect(result.current.token).toBe('new-token')
		expect(result.current.username).toBe('bobbelcher')
	})

	it('login leaves state unchanged and rethrows on failure', async () => {
		;(loginUser as jest.Mock).mockRejectedValue(
			new Error('Invalid credentials'),
		)
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await expect(
			act(async () => {
				await result.current.login('bobbelcher', 'wrong')
			}),
		).rejects.toThrow('Invalid credentials')

		expect(tokenStorage.save).not.toHaveBeenCalled()
		expect(result.current.token).toBeNull()
	})

	it('signup persists the token/username and updates state on success', async () => {
		;(registerUser as jest.Mock).mockResolvedValue({ token: 'signup-token' })
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.signup('newbelcher', 'correcthorse')
		})

		expect(registerUser).toHaveBeenCalledWith(
			'newbelcher',
			'correcthorse',
			undefined,
		)
		expect(result.current.token).toBe('signup-token')
		expect(result.current.username).toBe('newbelcher')
	})

	it('signup passes an optional email through to registerUser', async () => {
		;(registerUser as jest.Mock).mockResolvedValue({ token: 'signup-token' })
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.signup(
				'newbelcher',
				'correcthorse',
				'new@example.com',
			)
		})

		expect(registerUser).toHaveBeenCalledWith(
			'newbelcher',
			'correcthorse',
			'new@example.com',
		)
	})

	it('logout clears storage and resets state', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.token).toBe('stored-token')

		await act(async () => {
			await result.current.logout()
		})

		expect(tokenStorage.clear).toHaveBeenCalled()
		expect(result.current.token).toBeNull()
		expect(result.current.username).toBeNull()
	})

	it('deleteAccount calls the API then clears storage and resets state, like logout', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')
		;(deleteAccountRequest as jest.Mock).mockResolvedValue(undefined)
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.deleteAccount()
		})

		expect(deleteAccountRequest).toHaveBeenCalledWith('stored-token')
		expect(tokenStorage.clear).toHaveBeenCalled()
		expect(result.current.token).toBeNull()
		expect(result.current.username).toBeNull()
	})

	it('deleteAccount is a no-op when there is no token', async () => {
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.deleteAccount()
		})

		expect(deleteAccountRequest).not.toHaveBeenCalled()
	})

	it('deleteAccount rethrows on failure and leaves the session intact', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')
		;(deleteAccountRequest as jest.Mock).mockRejectedValue(
			new Error('Server error'),
		)
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await expect(
			act(async () => {
				await result.current.deleteAccount()
			}),
		).rejects.toThrow('Server error')

		expect(tokenStorage.clear).not.toHaveBeenCalled()
		expect(result.current.token).toBe('stored-token')
	})

	it('fetches and exposes the profile once a token is present', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')
		;(fetchProfile as jest.Mock).mockResolvedValue({
			username: 'bobbelcher',
			email: 'bob@example.com',
			emailVerifiedAt: '2024-01-01T00:00:00.000Z',
		})

		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))
		await waitFor(() => expect(result.current.email).toBe('bob@example.com'))

		expect(result.current.emailVerified).toBe(true)
	})

	it('updateUsername persists the new username and updates state', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(tokenStorage.getUsername as jest.Mock).mockResolvedValue('bobbelcher')
		;(updateUsernameRequest as jest.Mock).mockResolvedValue({
			username: 'newbelcher',
		})
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.updateUsername('bobbelcher', 'newbelcher')
		})

		expect(updateUsernameRequest).toHaveBeenCalledWith(
			'stored-token',
			'bobbelcher',
			'newbelcher',
		)
		expect(tokenStorage.save).toHaveBeenCalledWith('stored-token', 'newbelcher')
		expect(result.current.username).toBe('newbelcher')
	})

	it('updatePassword calls through without changing local state', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(updatePasswordRequest as jest.Mock).mockResolvedValue(undefined)
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.updatePassword('old-pass', 'new-pass')
		})

		expect(updatePasswordRequest).toHaveBeenCalledWith(
			'stored-token',
			'old-pass',
			'new-pass',
		)
	})

	it('updatePassword rethrows on failure', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(updatePasswordRequest as jest.Mock).mockRejectedValue(
			new Error('Current password is incorrect'),
		)
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await expect(
			act(async () => {
				await result.current.updatePassword('wrong', 'new-pass')
			}),
		).rejects.toThrow('Current password is incorrect')
	})

	it('updateEmail updates state to the new (unverified) email', async () => {
		;(tokenStorage.getToken as jest.Mock).mockResolvedValue('stored-token')
		;(updateEmailRequest as jest.Mock).mockResolvedValue({
			email: 'new@example.com',
		})
		const { result } = renderHook(() => useAuth(), { wrapper })
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(async () => {
			await result.current.updateEmail('new@example.com', 'old@example.com')
		})

		expect(updateEmailRequest).toHaveBeenCalledWith(
			'stored-token',
			'new@example.com',
			'old@example.com',
		)
		expect(result.current.email).toBe('new@example.com')
		expect(result.current.emailVerified).toBe(false)
	})

	it('throws when useAuth is called outside an AuthProvider', () => {
		expect(() => renderHook(() => useAuth())).toThrow(
			'useAuth must be used within an AuthProvider',
		)
	})
})
