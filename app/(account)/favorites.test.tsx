import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import Favorites from './favorites';
import { useSearchableItems } from '../../hooks/useSearchableItems';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/useSearchableItems');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

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

	it('tapping a favorited card navigates to its detail page instead of opening an external link', () => {
		render(<Favorites />);

		fireEvent.press(screen.getByText('Favorited Burger'));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: '/detail/[category]/[id]',
			params: { category: 'burgers', id: '1' },
		});
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

	it('shows a skeleton while items or favorites are still loading', () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			items: [],
			loading: true,
		});

		render(<Favorites />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();
	});

	it('tapping the star on a favorited row calls removeFavorite with its category and id', () => {
		render(<Favorites />);

		fireEvent.press(screen.getByLabelText('Remove from favorites'));

		expect(mockRemoveFavorite).toHaveBeenCalledWith('burger', 1);
	});

	it('filters the favorited items by category when a pill is selected', () => {
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => true,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});
		render(<Favorites />);

		expect(screen.getByText('Favorited Burger')).toBeVisible();
		expect(screen.getByText('Unfavorited Character')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by Characters'));

		expect(screen.queryByText('Favorited Burger')).toBeNull();
		expect(screen.getByText('Unfavorited Character')).toBeVisible();
	});

	it('filters favorited items by gender/hair color, and sorts alphabetically', () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			items: [
				{
					id: 'character-1',
					category: 'Characters',
					label: 'Bob Belcher',
					itemId: 1,
					favoriteCategory: 'character',
					gender: 'Male',
					hair: 'Brown',
				},
				{
					id: 'character-2',
					category: 'Characters',
					label: 'Linda Belcher',
					itemId: 2,
					favoriteCategory: 'character',
					gender: 'Female',
					hair: 'Brown',
				},
			],
			loading: false,
		});
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => true,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});
		render(<Favorites />);

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText('Linda Belcher')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by gender: Female'));

		expect(screen.queryByText('Bob Belcher')).toBeNull();
		expect(screen.getByText('Linda Belcher')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Filter by gender: Female'));
		fireEvent.press(screen.getByLabelText('Tap to sort A to Z'));

		expect(
			screen
				.UNSAFE_getByType(FlatList)
				.props.data.map((item: { label: string }) => item.label),
		).toEqual(['Bob Belcher', 'Linda Belcher']);
	});

	it('resets attribute filters when the screen loses focus', () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			items: [
				{
					id: 'character-1',
					category: 'Characters',
					label: 'Bob Belcher',
					itemId: 1,
					favoriteCategory: 'character',
					gender: 'Male',
				},
				{
					id: 'character-2',
					category: 'Characters',
					label: 'Linda Belcher',
					itemId: 2,
					favoriteCategory: 'character',
					gender: 'Female',
				},
			],
			loading: false,
		});
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => true,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});
		render(<Favorites />);

		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by gender: Female'));
		expect(screen.queryByText('Bob Belcher')).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText('Linda Belcher')).toBeVisible();
	});

	it('resets the category filter when the screen loses focus', () => {
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => true,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});
		render(<Favorites />);

		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by Characters'));
		expect(screen.queryByText('Favorited Burger')).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByText('Favorited Burger')).toBeVisible();
	});

	it('shows only the first page of favorites, revealing more as the list is scrolled', () => {
		const manyFavorites = Array.from({ length: 25 }, (_, i) => ({
			id: `character-${i}`,
			category: 'Characters',
			label: `Favorite Number ${i}`,
			itemId: i,
			favoriteCategory: 'character',
		}));
		(useSearchableItems as jest.Mock).mockReturnValue({
			items: manyFavorites,
			loading: false,
		});
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => true,
			removeFavorite: mockRemoveFavorite,
			loading: false,
		});
		render(<Favorites />);

		expect(screen.getByText('Favorite Number 0')).toBeVisible();
		expect(screen.getByText('Favorite Number 19')).toBeVisible();
		expect(screen.queryByText('Favorite Number 20')).toBeNull();
		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(20);

		// See app/index.test.tsx's equivalent test for why this asserts
		// on `data` growing rather than on newly revealed text actually
		// rendering — that part is FlatList's own virtualization, not
		// this app's logic, and RNTL can't simulate a real scroll.
		act(() => {
			screen.UNSAFE_getByType(FlatList).props.onEndReached();
		});

		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(25);
	});
});
