import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { deleteAccountRequest, loginUser, registerUser } from '../lib/apiClient'
import { tokenStorage } from '../lib/tokenStorage'

interface AuthContextValue {
	token: string | null
	username: string | null
	loading: boolean
	login: (username: string, password: string) => Promise<void>
	signup: (username: string, password: string) => Promise<void>
	logout: () => Promise<void>
	deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null)
	const [username, setUsername] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

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

	const login = useCallback(async (username: string, password: string) => {
		const { token } = await loginUser(username, password)
		await tokenStorage.save(token, username)
		setToken(token)
		setUsername(username)
	}, [])

	const signup = useCallback(async (username: string, password: string) => {
		const { token } = await registerUser(username, password)
		await tokenStorage.save(token, username)
		setToken(token)
		setUsername(username)
	}, [])

	const logout = useCallback(async () => {
		await tokenStorage.clear()
		setToken(null)
		setUsername(null)
	}, [])

	const deleteAccount = useCallback(async () => {
		if (!token) return
		await deleteAccountRequest(token)
		await logout()
	}, [token, logout])

	return (
		<AuthContext.Provider
			value={{
				token,
				username,
				loading,
				login,
				signup,
				logout,
				deleteAccount,
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
