import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Favorites from './favorites';
import { useSearchableItems } from '../hooks/useSearchableItems';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/useSearchableItems');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

const items = [
	{
		id: 'burger-1',
		category: 'Burgers of the Day',
		label: 'Favorited Burger',
		itemId: 1,
		favoriteCategory: 'burger',
	},
	{
		id: 'character-2',
		category: 'Characters',
		label: 'Unfavorited Character',
		itemId: 2,
		favoriteCategory: 'character',
	},
];

describe('Favorites screen', () => {
	const mockPush = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			loading: false,
		});
		(useSearchableItems as jest.Mock).mockReturnValue({
			items,
			loading: false,
		});
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: (category: string, itemId: number) =>
				category === 'burger' && itemId === 1,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('redirects to /login when there is no token and loading has settled', () => {
		(useAuth as jest.Mock).mockReturnValue({ token: null, loading: false });

		render(<Favorites />);

		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('does not redirect while the session is still being restored', () => {
		(useAuth as jest.Mock).mockReturnValue({ token: null, loading: true });

		render(<Favorites />);

		expect(mockPush).not.toHaveBeenCalled();
	});

	it('shows only the favorited items, not everything from useSearchableItems', () => {
		render(<Favorites />);

		expect(screen.getByText('Favorited Burger')).toBeVisible();
		expect(screen.queryByText('Unfavorited Character')).toBeNull();
	});

	it('shows "No favorites yet." when nothing is favorited', () => {
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});

		render(<Favorites />);

		expect(screen.getByText('No favorites yet.')).toBeVisible();
	});

	it('shows a loading state while items or favorites are still loading', () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			items: [],
			loading: true,
		});

		render(<Favorites />);

		expect(screen.getByText('Loading...')).toBeVisible();
	});

	it('tapping the star on a favorited row calls removeFavorite with its category and id', () => {
		render(<Favorites />);

		fireEvent.press(screen.getByLabelText('Remove from favorites'));

		expect(mockRemoveFavorite).toHaveBeenCalledWith('burger', 1);
	});
});
