import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Login from './login';
import { useAuth } from '../hooks/useAuth';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../hooks/useAuth');

// useFocusEffect is normally driven by real navigation focus events,
// which don't exist in a bare RNTL render. Calling the callback directly
// at render time captures its returned cleanup function so a test can
// invoke it to simulate a blur (navigating away), without needing a real
// navigation container.
let focusEffectCleanup: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		focusEffectCleanup = callback() ?? undefined;
	},
}));

describe('Login screen', () => {
	const mockPush = jest.fn();
	const mockLogin = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('submits the entered email/password and navigates home on success', async () => {
		mockLogin.mockResolvedValueOnce(undefined);
		render(<Login />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'bob@bobsburgers.com',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText('Password'),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Log In' }));
		});

		expect(mockLogin).toHaveBeenCalledWith(
			'bob@bobsburgers.com',
			'correcthorse',
		);
		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('shows an error message and does not navigate on failure', async () => {
		mockLogin.mockRejectedValueOnce(new Error('Invalid email or password'));
		render(<Login />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'bob@bobsburgers.com',
		);
		fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrong');
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Log In' }));
		});

		expect(screen.getByText('Invalid email or password')).toBeVisible();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('navigates to Sign Up when the link is pressed', () => {
		render(<Login />);

		fireEvent.press(screen.getByText('Need an account? Sign Up'));

		expect(mockPush).toHaveBeenCalledWith('/signup');
	});

	it('clears the email/password fields when the screen loses focus', () => {
		render(<Login />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'bob@bobsburgers.com',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText('Password'),
			'correcthorse',
		);

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByPlaceholderText('Email').props.value).toBe('');
		expect(screen.getByPlaceholderText('Password').props.value).toBe('');
	});
});
