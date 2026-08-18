import { FlatList, Image } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import EndCredits from './endCredits';
import { getEndCreditsSequences } from '../../hooks/fetchEndCreditsSequences';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

jest.mock('../../hooks/fetchEndCreditsSequences');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useTheme');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

// See app/index.test.tsx's identical mock for why this is needed: a bare
// RNTL render has no real navigation container, and endCredits.tsx now
// calls useFocusEffect to clear its search query/sort on blur.
let focusEffectCleanup: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		focusEffectCleanup = callback() ?? undefined;
	},
}));

async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('EndCredits screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
		});
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
		});
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	it('shows a skeleton while loading', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([]);
		render(<EndCredits />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();
	});

	it('shows a bio blurb with season/episode, with an image when one is provided', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{
				id: 1,
				image: 'https://img/1.png',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<EndCredits />);
		await flush();

		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		).toBeVisible();
		// No testID exists on the Image, so UNSAFE_queryByType is the way
		// to assert on a host component by its React type directly.
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull();
	});

	it('omits the image entirely when the item has none', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flush();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([]);
		render(<EndCredits />);
		await flush();
		expect(screen.getByText('End Credits UH OH...')).toBeVisible();
	});

	it('navigates to the detail page when a card is pressed', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flush();

		fireEvent.press(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		);

		expect(mockPush).toHaveBeenCalledWith({
			pathname: '/detail/[category]/[id]',
			params: { category: 'endCredits', id: '1' },
		});
	});

	it('tapping the favorite star calls addFavorite with the end_credit category and id', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flush();

		fireEvent.press(
			screen.getByLabelText('Add Season 1, Episode 2 end credits to favorites'),
		);

		expect(mockAddFavorite).toHaveBeenCalledWith('end_credit', 1);
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getEndCreditsSequences as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([
				{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
			]);

		render(<EndCredits />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getEndCreditsSequences).toHaveBeenCalledTimes(2);
		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		).toBeVisible();
	});

	it('search bar narrows the list to end credits matching the query', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
			{ id: 2, image: '', season: 3, episode: 4, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flush();

		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		).toBeVisible();
		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 3, Episode 4.',
			),
		).toBeVisible();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search End Credits...'),
			'season 3',
		);

		expect(
			screen.queryByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		).toBeNull();
		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 3, Episode 4.',
			),
		).toBeVisible();
	});

	it('Filter By only offers Sort, with no category or gender/hair options', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flush();
		fireEvent.press(screen.getByLabelText('Show filter options'));

		expect(screen.getByLabelText('Tap to sort A to Z')).toBeVisible();
		expect(screen.queryByLabelText('Filter by Characters')).toBeNull();
		expect(screen.queryByLabelText('Filter by gender: Male')).toBeNull();
	});

	it('clears the search query when the screen loses focus', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
			{ id: 2, image: '', season: 3, episode: 4, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flush();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search End Credits...'),
			'season 3',
		);
		expect(
			screen.queryByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(
			screen.getByPlaceholderText('Search End Credits...').props.value,
		).toBe('');
		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 2.',
			),
		).toBeVisible();
	});

	it('shows only the first page of end credits, revealing more as the list is scrolled', async () => {
		const manyEndCredits = Array.from({ length: 25 }, (_, i) => ({
			id: i,
			image: '',
			season: 1,
			episode: i + 1,
			episodeUrl: '',
		}));
		(getEndCreditsSequences as jest.Mock).mockResolvedValue(manyEndCredits);

		render(<EndCredits />);
		await flush();

		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 1.',
			),
		).toBeVisible();
		expect(
			screen.getByText(
				'A hand-drawn end credits sequence from Season 1, Episode 20.',
			),
		).toBeVisible();
		expect(
			screen.queryByText(
				'A hand-drawn end credits sequence from Season 1, Episode 21.',
			),
		).toBeNull();
		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(20);

		act(() => {
			screen.UNSAFE_getByType(FlatList).props.onEndReached();
		});

		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(25);
	});
});
