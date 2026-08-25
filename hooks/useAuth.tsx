import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
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

interface AuthContextValue {
	token: string | null
	username: string | null
	email: string | null
	emailVerified: boolean
	loading: boolean
	login: (username: string, password: string) => Promise<void>
	signup: (username: string, password: string, email?: string) => Promise<void>
	logout: () => Promise<void>
	deleteAccount: () => Promise<void>
	updateUsername: (oldUsername: string, newUsername: string) => Promise<void>
	updatePassword: (oldPassword: string, newPassword: string) => Promise<void>
	updateEmail: (newEmail: string, oldEmail?: string) => Promise<void>
	refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null)
	const [username, setUsername] = useState<string | null>(null)
	const [email, setEmail] = useState<string | null>(null)
	const [emailVerified, setEmailVerified] = useState(false)
	const [loading, setLoading] = useState(true)

	// Neither the JWT nor local storage carries email/verification status
	// (only username and the token do) — this is the one place that syncs
	// them from the server, for whichever token is currently active.
	const refreshProfile = useCallback(async () => {
		if (!token) return
		const profile = await fetchProfile(token)
		setEmail(profile.email)
		setEmailVerified(Boolean(profile.emailVerifiedAt))
	}, [token])

	useEffect(() => {
		async function restoreSession() {
			const [storedToken, storedUsername] = await Promise.all([
				tokenStorage.getToken(),
				tokenStorage.getUsername(),
			])
			setToken(storedToken)
			setUsername(storedUsername)
			setLoading(false)
		}
		restoreSession()
	}, [])

	useEffect(() => {
		if (token) refreshProfile()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token])

	const login = useCallback(async (username: string, password: string) => {
		const { token } = await loginUser(username, password)
		await tokenStorage.save(token, username)
		setToken(token)
		setUsername(username)
	}, [])

	const signup = useCallback(
		async (username: string, password: string, email?: string) => {
			const { token } = await registerUser(username, password, email)
			await tokenStorage.save(token, username)
			setToken(token)
			setUsername(username)
		},
		[],
	)

	const logout = useCallback(async () => {
		await tokenStorage.clear()
		setToken(null)
		setUsername(null)
		setEmail(null)
		setEmailVerified(false)
	}, [])

	const deleteAccount = useCallback(async () => {
		if (!token) return
		await deleteAccountRequest(token)
		await logout()
	}, [token, logout])

	const updateUsername = useCallback(
		async (oldUsername: string, newUsername: string) => {
			if (!token) return
			const result = await updateUsernameRequest(
				token,
				oldUsername,
				newUsername,
			)
			await tokenStorage.save(token, result.username)
			setUsername(result.username)
		},
		[token],
	)

	const updatePassword = useCallback(
		async (oldPassword: string, newPassword: string) => {
			if (!token) return
			await updatePasswordRequest(token, oldPassword, newPassword)
		},
		[token],
	)

	const updateEmail = useCallback(
		async (newEmail: string, oldEmail?: string) => {
			if (!token) return
			const result = await updateEmailRequest(token, newEmail, oldEmail)
			// Changing email always resets it to unverified server-side — set
			// that locally too rather than re-fetching, since we already know
			// the outcome.
			setEmail(result.email)
			setEmailVerified(false)
		},
		[token],
	)

	return (
		<AuthContext.Provider
			value={{
				token,
				username,
				email,
				emailVerified,
				loading,
				login,
				signup,
				logout,
				deleteAccount,
				updateUsername,
				updatePassword,
				updateEmail,
				refreshProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
