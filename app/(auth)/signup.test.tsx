import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Signup from './signup';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { LIGHT_THEME_COLORS } from '../../jest/themeColorsFixture';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useTheme');

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

const USERNAME_PLACEHOLDER = 'Username (2-25 chars)';
const PASSWORD_PLACEHOLDER = 'Password (min. 8 characters)';

describe('Signup screen', () => {
	const mockPush = jest.fn();
	const mockSignup = jest.fn();

	beforeEach(() => {
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
			colors: LIGHT_THEME_COLORS,
		});
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useAuth as jest.Mock).mockReturnValue({ signup: mockSignup });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('submits the entered username/password and navigates home on success', async () => {
		mockSignup.mockResolvedValueOnce(undefined);
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'newbelcher',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText(PASSWORD_PLACEHOLDER),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});

		expect(mockSignup).toHaveBeenCalledWith('newbelcher', 'correcthorse');
		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('shows an error message and does not navigate on failure', async () => {
		mockSignup.mockRejectedValueOnce(new Error('Username already taken'));
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'newbelcher',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText(PASSWORD_PLACEHOLDER),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});

		expect(screen.getByText('Username already taken')).toBeVisible();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('rejects a symbol in the username client-side, without ever calling signup', async () => {
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'bob_belcher',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText(PASSWORD_PLACEHOLDER),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});

		expect(
			screen.getByText('Username can only contain letters and numbers.'),
		).toBeVisible();
		expect(mockSignup).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('rejects a username shorter than 2 characters client-side', async () => {
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'b',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText(PASSWORD_PLACEHOLDER),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});

		expect(
			screen.getByText('Username must be at least 2 characters.'),
		).toBeVisible();
		expect(mockSignup).not.toHaveBeenCalled();
	});

	it('clears the username error as soon as the user edits the field again', async () => {
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'bob_belcher',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
		});
		expect(
			screen.getByText('Username can only contain letters and numbers.'),
		).toBeVisible();

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'bobbelcher',
		);

		expect(
			screen.queryByText('Username can only contain letters and numbers.'),
		).toBeNull();
	});

	it('navigates to Log In when the link is pressed', () => {
		render(<Signup />);

		fireEvent.press(screen.getByText('Already have an account? Log In'));

		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('clears the username/password fields when the screen loses focus', () => {
		render(<Signup />);

		fireEvent.changeText(
			screen.getByPlaceholderText(USERNAME_PLACEHOLDER),
			'newbelcher',
		);
		fireEvent.changeText(
			screen.getByPlaceholderText(PASSWORD_PLACEHOLDER),
			'correcthorse',
		);

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByPlaceholderText(USERNAME_PLACEHOLDER).props.value).toBe(
			'',
		);
		expect(screen.getByPlaceholderText(PASSWORD_PLACEHOLDER).props.value).toBe(
			'',
		);
	});
});
