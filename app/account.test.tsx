import { Alert, Platform } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Account from './account';
import { useAuth } from '../hooks/useAuth';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../hooks/useAuth');

describe('Account screen', () => {
	const mockPush = jest.fn();
	const mockDeleteAccount = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			email: 'bob@bobsburgers.com',
			loading: false,
			deleteAccount: mockDeleteAccount,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('shows the logged-in email', () => {
		render(<Account />);
		expect(screen.getByText('bob@bobsburgers.com')).toBeVisible();
	});

	it('redirects to /login when there is no token and loading has settled', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			email: null,
			loading: false,
			deleteAccount: mockDeleteAccount,
		});

		render(<Account />);

		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('does not redirect while the session is still being restored', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			email: null,
			loading: true,
			deleteAccount: mockDeleteAccount,
		});

		render(<Account />);

		expect(mockPush).not.toHaveBeenCalled();
	});

	describe('on native platforms', () => {
		beforeEach(() => {
			Platform.OS = 'ios';
		});

		it('deletes the account when the native confirm alert is accepted', async () => {
			mockDeleteAccount.mockResolvedValue(undefined);
			jest.spyOn(Alert, 'alert').mockImplementation((_title, _msg, buttons) => {
				const deleteButton = buttons?.find((b) => b.text === 'Delete');
				deleteButton?.onPress?.();
			});
			render(<Account />);

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));
			});

			expect(mockDeleteAccount).toHaveBeenCalled();
			expect(mockPush).toHaveBeenCalledWith('/');
		});

		it('does not delete when the native confirm alert is cancelled', async () => {
			jest.spyOn(Alert, 'alert').mockImplementation(() => {
				// Simulates the user tapping "Cancel" — no callback invoked.
			});
			render(<Account />);

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));
			});

			expect(mockDeleteAccount).not.toHaveBeenCalled();
		});
	});

	describe('on web', () => {
		const mockConfirm = jest.fn();

		beforeEach(() => {
			Platform.OS = 'web';
			global.window = {
				confirm: mockConfirm,
			} as unknown as Window & typeof globalThis;
		});

		afterEach(() => {
			Platform.OS = 'ios';
			delete (global as { window?: Window }).window;
		});

		it('deletes the account when window.confirm is accepted', async () => {
			mockConfirm.mockReturnValue(true);
			mockDeleteAccount.mockResolvedValue(undefined);
			render(<Account />);

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));
			});

			expect(mockDeleteAccount).toHaveBeenCalled();
			expect(mockPush).toHaveBeenCalledWith('/');
		});

		it('does not delete when window.confirm is declined', async () => {
			mockConfirm.mockReturnValue(false);
			render(<Account />);

			await act(async () => {
				fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));
			});

			expect(mockDeleteAccount).not.toHaveBeenCalled();
		});
	});

	it('shows an error message when deleting fails', async () => {
		Platform.OS = 'web';
		global.window = {
			confirm: jest.fn().mockReturnValue(true),
		} as unknown as Window & typeof globalThis;
		mockDeleteAccount.mockRejectedValue(new Error('Server error'));
		render(<Account />);

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));
		});

		expect(screen.getByText('Server error')).toBeVisible();
		expect(mockPush).not.toHaveBeenCalledWith('/');

		Platform.OS = 'ios';
		delete (global as { window?: Window }).window;
	});
});
