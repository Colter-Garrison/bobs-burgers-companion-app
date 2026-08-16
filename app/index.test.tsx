import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Index from './index';
import { useSearchableItems } from '../hooks/useSearchableItems';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/useSearchableItems');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
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

describe('Home / search screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			items: [
				{
					id: 'burger-1',
					category: 'Burgers of the Day',
					label: 'Test Burger',
					itemId: 1,
					favoriteCategory: 'burger',
				},
				{
					id: 'character-2',
					category: 'Characters',
					label: 'Bob Belcher',
					itemId: 2,
					favoriteCategory: 'character',
				},
			],
		});
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
		});
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('shows nothing search-related until the user types', () => {
		render(<Index />);
		expect(screen.queryByText('No results found.')).toBeNull();
		expect(screen.queryByText('Test Burger')).toBeNull();
	});

	it('live-filters as the user types, case-insensitively, on partial matches', () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'bob');

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.queryByText('Test Burger')).toBeNull();
	});

	it('shows "No results found." for a query matching nothing', () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'zzzznomatch');

		expect(screen.getByText('No results found.')).toBeVisible();
	});

	it("tapping a result's favorite star calls addFavorite with that item's category and id", () => {
		render(<Index />);
		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'bob',
		);

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('character', 2);
	});

	it('clears the search query when the screen loses focus', () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'bob');
		expect(screen.getByText('Bob Belcher')).toBeVisible();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(input.props.value).toBe('');
		expect(screen.queryByText('Bob Belcher')).toBeNull();
	});
});
