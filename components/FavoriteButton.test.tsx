import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { FavoriteButton } from './FavoriteButton';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

describe('FavoriteButton', () => {
	const mockPush = jest.fn();
	const mockOnToggle = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('calls onToggle when pressed while logged in', () => {
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		render(<FavoriteButton favorited={false} onToggle={mockOnToggle} />);

		fireEvent.press(screen.getByRole('button'));

		expect(mockOnToggle).toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('routes to /login instead of calling onToggle while logged out', () => {
		(useAuth as jest.Mock).mockReturnValue({ token: null });
		render(<FavoriteButton favorited={false} onToggle={mockOnToggle} />);

		fireEvent.press(screen.getByRole('button'));

		expect(mockPush).toHaveBeenCalledWith('/login');
		expect(mockOnToggle).not.toHaveBeenCalled();
	});

	it('has an accessible label reflecting whether it is favorited', () => {
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		const { rerender } = render(
			<FavoriteButton favorited={false} onToggle={mockOnToggle} />,
		);
		expect(screen.getByLabelText('Add to favorites')).toBeVisible();

		rerender(<FavoriteButton favorited={true} onToggle={mockOnToggle} />);
		expect(screen.getByLabelText('Remove from favorites')).toBeVisible();
	});
});
