import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Signup from './signup';
import { useAuth } from '../hooks/useAuth';

jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('../hooks/useAuth');

describe('Signup screen', () => {
	const mockPush = jest.fn();
	const mockReplace = jest.fn();
	const mockSignup = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({
			push: mockPush,
			replace: mockReplace,
		});
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
		expect(mockReplace).toHaveBeenCalledWith('/');
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
		expect(mockReplace).not.toHaveBeenCalled();
	});

	it('navigates to Log In when the link is pressed', () => {
		render(<Signup />);

		fireEvent.press(screen.getByText('Already have an account? Log In'));

		expect(mockPush).toHaveBeenCalledWith('/login');
	});
});
