import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Login from './login';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { LIGHT_THEME_COLORS } from '../../jest/themeColorsFixture';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useTheme');

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
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
			colors: LIGHT_THEME_COLORS,
		});
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('submits the entered username/password and navigates home on success', async () => {
		mockLogin.mockResolvedValueOnce(undefined);
		render(<Login />);

		fireEvent.changeText(screen.getByPlaceholderText('Username'), 'bobbelcher');
		fireEvent.changeText(
			screen.getByPlaceholderText('Password'),
			'correcthorse',
		);
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Log In' }));
		});

		expect(mockLogin).toHaveBeenCalledWith('bobbelcher', 'correcthorse');
		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('shows an error message and does not navigate on failure', async () => {
		mockLogin.mockRejectedValueOnce(new Error('Invalid username or password'));
		render(<Login />);

		fireEvent.changeText(screen.getByPlaceholderText('Username'), 'bobbelcher');
		fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrong');
		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Log In' }));
		});

		expect(screen.getByText('Invalid username or password')).toBeVisible();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('navigates to Sign Up when the link is pressed', () => {
		render(<Login />);

		fireEvent.press(screen.getByText('Need an account? Sign Up'));

		expect(mockPush).toHaveBeenCalledWith('/signup');
	});

	it('clears the username/password fields when the screen loses focus', () => {
		render(<Login />);

		fireEvent.changeText(screen.getByPlaceholderText('Username'), 'bobbelcher');
		fireEvent.changeText(
			screen.getByPlaceholderText('Password'),
			'correcthorse',
		);

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByPlaceholderText('Username').props.value).toBe('');
		expect(screen.getByPlaceholderText('Password').props.value).toBe('');
	});
});
