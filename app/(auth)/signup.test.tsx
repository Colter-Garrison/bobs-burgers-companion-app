import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Signup from './signup';
import { useAuth } from '../../hooks/useAuth';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../../hooks/useAuth');

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

describe('Signup screen', () => {
	const mockPush = jest.fn();
	const mockSignup = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useAuth as jest.Mock).mockReturnValue({ signup: mockSignup });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('submits the entered email/password and navigates home on success', async () => {
		mockSignup.mockResolvedValueOnce(undefined);
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'new@bobsburgers.com',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText('Password (min. 8 characters)'),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});

		expect(mockSignup).toHaveBeenCalledWith(
			'new@bobsburgers.com',
			'correcthorse',
		);
		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('shows an error message and does not navigate on failure', async () => {
		mockSignup.mockRejectedValueOnce(new Error('Email already registered'));
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'new@bobsburgers.com',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText('Password (min. 8 characters)'),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});

		expect(screen.getByText('Email already registered')).toBeVisible();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('navigates to Log In when the link is pressed', () => {
		render(<Signup />);

		fireEvent.press(screen.getByText('Already have an account? Log In'));

		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('clears the email/password fields when the screen loses focus', () => {
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Email'),
			'new@bobsburgers.com',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText('Password (min. 8 characters)'),
			'correcthorse',
		);

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByPlaceholderText('Email').props.value).toBe('');
		expect(
			screen.getByPlaceholderText('Password (min. 8 characters)').props.value,
		).toBe('');
	});
});
