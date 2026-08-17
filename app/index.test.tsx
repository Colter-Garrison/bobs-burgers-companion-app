import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
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

// The first keystroke of a search triggers a real retry() call (see
// app/index.tsx) whose resolution clears the skeleton — flush that
// microtask so a test can assert on the post-loading content.
async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('Home / search screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();
	const mockRetry = jest.fn();

	beforeEach(() => {
		mockRetry.mockResolvedValue(undefined);
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			error: null,
			retry: mockRetry,
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

	it('live-filters as the user types, case-insensitively, on partial matches', async () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'bob');
		await flush();

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.queryByText('Test Burger')).toBeNull();
	});

	it('shows "No results found." for a query matching nothing', async () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'zzzznomatch');
		await flush();

		expect(screen.getByText('No results found.')).toBeVisible();
	});

	it("tapping a result's favorite star calls addFavorite with that item's category and id", async () => {
		render(<Index />);
		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'bob',
		);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('character', 2);
	});

	it('shows the skeleton the instant a search starts, before any promise has resolved', () => {
		// A promise that never resolves during this test — proves the
		// skeleton appears synchronously off the keystroke itself, not
		// after retry()'s promise settles.
		mockRetry.mockReturnValue(new Promise<void>(() => {}));
		render(<Index />);

		expect(screen.queryByTestId('category-skeleton')).toBeNull();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'bob',
		);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();
	});

	it('hides the skeleton once the refetch resolves, and keeps it up while pending', async () => {
		let resolveRetry: () => void = () => {};
		mockRetry.mockReturnValue(
			new Promise<void>((resolve) => {
				resolveRetry = resolve;
			}),
		);
		render(<Index />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'bob',
		);
		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await act(async () => {
			resolveRetry();
			await Promise.resolve();
		});

		expect(screen.queryByTestId('category-skeleton')).toBeNull();
	});

	it('re-fetches once when a search starts, not on every keystroke, and re-arms after clearing', async () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'b');
		expect(mockRetry).toHaveBeenCalledTimes(1);
		await flush();

		fireEvent.changeText(input, 'bo');
		fireEvent.changeText(input, 'bob');
		expect(mockRetry).toHaveBeenCalledTimes(1);
		await flush();

		fireEvent.changeText(input, '');
		fireEvent.changeText(input, 'l');
		expect(mockRetry).toHaveBeenCalledTimes(2);
		await flush();
	});

	it('shows an error banner with a working retry while still showing the results that did load', async () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			error: 'Some results may be missing.',
			retry: mockRetry,
			items: [
				{
					id: 'burger-1',
					category: 'Burgers of the Day',
					label: 'Test Burger',
					itemId: 1,
					favoriteCategory: 'burger',
				},
			],
		});
		render(<Index />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'burger',
		);
		await flush();

		expect(screen.getByText('Some results may be missing.')).toBeVisible();
		expect(screen.getByText('Test Burger')).toBeVisible();

		fireEvent.press(screen.getByText('Retry'));
		expect(mockRetry).toHaveBeenCalled();
	});

	it('shows the Filter By pill even before the user has typed a search query', () => {
		render(<Index />);
		expect(screen.getByLabelText('Show filter options')).toBeVisible();
	});

	it('filters results by category when a pill is selected', async () => {
		render(<Index />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'b',
		);
		await flush();

		expect(screen.getByText('Test Burger')).toBeVisible();
		expect(screen.getByText('Bob Belcher')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by Characters'));

		expect(screen.queryByText('Test Burger')).toBeNull();
		expect(screen.getByText('Bob Belcher')).toBeVisible();
	});

	it('filters results by gender/hair color, and sorts alphabetically, via the Filter By panel', async () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			error: null,
			retry: mockRetry,
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
		});
		render(<Index />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'belcher',
		);
		await flush();

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText('Linda Belcher')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by gender: Male'));

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.queryByText('Linda Belcher')).toBeNull();

		// Clear the gender filter, then sort instead.
		fireEvent.press(screen.getByLabelText('Filter by gender: Male'));
		fireEvent.press(screen.getByLabelText('Tap to sort A to Z'));

		const list = screen.UNSAFE_getByType(FlatList);
		expect(
			list.props.data.map((item: { label: string }) => item.label),
		).toEqual(['Bob Belcher', 'Linda Belcher']);

		fireEvent.press(screen.getByLabelText('Sorted A to Z. Tap to sort Z to A'));
		expect(
			screen
				.UNSAFE_getByType(FlatList)
				.props.data.map((item: { label: string }) => item.label),
		).toEqual(['Linda Belcher', 'Bob Belcher']);
	});

	it('shows only the first page of results, revealing more as the list is scrolled', async () => {
		const manyItems = Array.from({ length: 25 }, (_, i) => ({
			id: `character-${i}`,
			category: 'Characters',
			label: `Bob Number ${i}`,
			itemId: i,
			favoriteCategory: 'character',
		}));
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			error: null,
			retry: mockRetry,
			items: manyItems,
		});
		render(<Index />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'bob',
		);
		await flush();

		expect(screen.getByText('Bob Number 0')).toBeVisible();
		expect(screen.getByText('Bob Number 19')).toBeVisible();
		expect(screen.queryByText('Bob Number 20')).toBeNull();
		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(20);

		// What actually mounts newly revealed rows as the user scrolls is
		// FlatList's own internal virtualization, which RNTL can't
		// exercise without a real scroll — so this asserts on the `data`
		// this screen hands to FlatList growing correctly, which is what
		// usePagination (this app's own logic) is responsible for.
		//
		// fireEvent(el, 'endReached') doesn't reach onEndReached here —
		// the testID forwards to an inner host node, not the composite
		// FlatList element holding the original prop — so the prop is
		// grabbed and called directly instead.
		act(() => {
			screen.UNSAFE_getByType(FlatList).props.onEndReached();
		});

		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(25);
	});

	it('clears the search query when the screen loses focus', async () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'bob');
		await flush();
		expect(screen.getByText('Bob Belcher')).toBeVisible();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(input.props.value).toBe('');
		expect(screen.queryByText('Bob Belcher')).toBeNull();
	});

	it('clears active attribute filters when the screen loses focus', async () => {
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			error: null,
			retry: mockRetry,
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
		});
		render(<Index />);

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'belcher',
		);
		await flush();
		fireEvent.press(screen.getByLabelText('Show filter options'));
		fireEvent.press(screen.getByLabelText('Filter by gender: Male'));
		expect(screen.queryByText('Linda Belcher')).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		fireEvent.changeText(
			screen.getByPlaceholderText('Search burgers, characters, episodes...'),
			'belcher',
		);
		await flush();

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText('Linda Belcher')).toBeVisible();
	});
});
