// expo-secure-store has no web implementation at all, so this wraps it
// with a localStorage fallback there. Native gets Keychain/Keystore-backed
// encrypted storage; web gets the best available option (localStorage
// isn't encrypted, but there's nothing more secure available to a
// browser tab).
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bbca_auth_token';
const EMAIL_KEY = 'bbca_auth_email';

async function getItem(key: string): Promise<string | null> {
	if (Platform.OS === 'web') {
		return globalThis.localStorage.getItem(key);
	}
	return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
	if (Platform.OS === 'web') {
		globalThis.localStorage.setItem(key, value);
		return;
	}
	await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
	if (Platform.OS === 'web') {
		globalThis.localStorage.removeItem(key);
		return;
	}
	await SecureStore.deleteItemAsync(key);
}

export const tokenStorage = {
	getToken(): Promise<string | null> {
		return getItem(TOKEN_KEY);
	},
	getEmail(): Promise<string | null> {
		return getItem(EMAIL_KEY);
	},
	// The backend has no "who am I" endpoint — the JWT payload only
	// carries a userId — so email has to be persisted alongside the
	// token at login/signup time to survive an app relaunch.
	async save(token: string, email: string): Promise<void> {
		await setItem(TOKEN_KEY, token);
		await setItem(EMAIL_KEY, email);
	},
	async clear(): Promise<void> {
		await deleteItem(TOKEN_KEY);
		await deleteItem(EMAIL_KEY);
	},
};
