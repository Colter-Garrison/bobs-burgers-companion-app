import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bbca_auth_token';
const USERNAME_KEY = 'bbca_auth_username';

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
	getUsername(): Promise<string | null> {
		return getItem(USERNAME_KEY);
	},
	async save(token: string, username: string): Promise<void> {
		await setItem(TOKEN_KEY, token);
		await setItem(USERNAME_KEY, username);
	},
	async clear(): Promise<void> {
		await deleteItem(TOKEN_KEY);
		await deleteItem(USERNAME_KEY);
	},
};
