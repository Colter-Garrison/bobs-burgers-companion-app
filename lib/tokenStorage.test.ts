import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { tokenStorage } from './tokenStorage';

jest.mock('expo-secure-store', () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
	deleteItemAsync: jest.fn(),
}));

describe('tokenStorage', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('on native platforms', () => {
		beforeEach(() => {
			Platform.OS = 'ios';
		});

		it('save writes the token and email via SecureStore', async () => {
			await tokenStorage.save('token-abc', 'bob@bobsburgers.com');

			expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
				'bbca_auth_token',
				'token-abc',
			);
			expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
				'bbca_auth_email',
				'bob@bobsburgers.com',
			);
		});

		it('getToken/getEmail read via SecureStore', async () => {
			(SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(
				'token-abc',
			);
			await expect(tokenStorage.getToken()).resolves.toBe('token-abc');
			expect(SecureStore.getItemAsync).toHaveBeenCalledWith('bbca_auth_token');
		});

		it('clear deletes both keys via SecureStore', async () => {
			await tokenStorage.clear();

			expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
				'bbca_auth_token',
			);
			expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
				'bbca_auth_email',
			);
		});
	});

	describe('on web', () => {
		const localStorageMock = {
			getItem: jest.fn(),
			setItem: jest.fn(),
			removeItem: jest.fn(),
		};

		beforeEach(() => {
			Platform.OS = 'web';
			globalThis.localStorage = localStorageMock as unknown as Storage;
			localStorageMock.getItem.mockReset();
			localStorageMock.setItem.mockReset();
			localStorageMock.removeItem.mockReset();
		});

		afterEach(() => {
			Platform.OS = 'ios';
			delete (globalThis as { localStorage?: Storage }).localStorage;
		});

		it('save writes the token and email via localStorage, not SecureStore', async () => {
			await tokenStorage.save('token-abc', 'bob@bobsburgers.com');

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'bbca_auth_token',
				'token-abc',
			);
			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				'bbca_auth_email',
				'bob@bobsburgers.com',
			);
			expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
		});

		it('getToken reads via localStorage', async () => {
			localStorageMock.getItem.mockReturnValueOnce('token-abc');

			await expect(tokenStorage.getToken()).resolves.toBe('token-abc');
			expect(localStorageMock.getItem).toHaveBeenCalledWith('bbca_auth_token');
		});

		it('clear removes both keys via localStorage', async () => {
			await tokenStorage.clear();

			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				'bbca_auth_token',
			);
			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				'bbca_auth_email',
			);
		});
	});
});
