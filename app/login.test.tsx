import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Login from './login';
import { useAuth } from '../hooks/useAuth';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../hooks/useAuth');

describe('Login screen', () => {
	const mockPush = jest.fn();
	const mockReplace = jest.fn();
	const mockLogin = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			replace: mockReplace,
		});
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
		expect(mockReplace).toHaveBeenCalledWith('/');
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
		expect(mockReplace).not.toHaveBeenCalled();
	});

	it('navigates to Sign Up when the link is pressed', () => {
		render(<Login />);

		fireEvent.press(screen.getByText('Need an account? Sign Up'));

		expect(mockPush).toHaveBeenCalledWith('/signup');
	});
});
