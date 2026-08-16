import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { loginUser, registerUser } from '../lib/apiClient';
import { tokenStorage } from '../lib/tokenStorage';

interface AuthContextValue {
	token: string | null;
	email: string | null;
	// True only while restoring a persisted session on app launch —
	// screens that gate on auth state should wait for this before
	// deciding whether to treat the user as logged out.
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [email, setEmail] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function restoreSession() {
			const [storedToken, storedEmail] = await Promise.all([
				tokenStorage.getToken(),
				tokenStorage.getEmail(),
			]);
			setToken(storedToken);
			setEmail(storedEmail);
			setLoading(false);
		}
		restoreSession();
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const { token } = await loginUser(email, password);
		await tokenStorage.save(token, email);
		setToken(token);
		setEmail(email);
	}, []);

	const signup = useCallback(async (email: string, password: string) => {
		const { token } = await registerUser(email, password);
		await tokenStorage.save(token, email);
		setToken(token);
		setEmail(email);
	}, []);

	const logout = useCallback(async () => {
		await tokenStorage.clear();
		setToken(null);
		setEmail(null);
	}, []);

	return (
		<AuthContext.Provider
			value={{ token, email, loading, login, signup, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
