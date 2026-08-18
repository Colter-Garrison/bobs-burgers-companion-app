import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import Episodes from './episodes';
import { getEpisodes } from '../../hooks/fetchEpisodes';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

jest.mock('../../hooks/fetchEpisodes');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useTheme');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

// See app/index.test.tsx's identical mock for why this is needed: a bare
// RNTL render has no real navigation container, and episodes.tsx now
// calls useFocusEffect to clear its search query/sort on blur.
let focusEffectCleanup: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		focusEffectCleanup = callback() ?? undefined;
	},
}));

const mockEpisode = {
	id: 1,
	name: 'Human Flesh',
	description: "It's a pilot episode.",
	productionCode: '1ASA01',
	airDate: '2011-01-09',
	season: 1,
	episode: 1,
	totalViewers: '9.02 million',
	url: '',
	wikiUrl: 'https://wiki/human-flesh',
};

async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('Episodes screen', () => {
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

	it('shows a skeleton while loading, then the name and a bio blurb', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();

		expect(screen.getByText('Human Flesh')).toBeVisible();
		expect(
			screen.getByText("It's a pilot episode. Season 1, Episode 1."),
		).toBeVisible();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([]);
		render(<Episodes />);
		await flush();
		expect(screen.getByText('Episode UH OH...')).toBeVisible();
	});

	it('navigates to the detail page (not the external wiki link) when an episode card is pressed', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);
		await flush();

		fireEvent.press(screen.getByText('Human Flesh'));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: '/detail/[category]/[id]',
			params: { category: 'episodes', id: '1' },
		});
	});

	it('tapping the favorite star calls addFavorite with the episode category and id, not navigation', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('episode', 1);
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getEpisodes as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([mockEpisode]);

		render(<Episodes />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getEpisodes).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Human Flesh')).toBeVisible();
	});

	it('search bar narrows the list to episodes matching the query', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([
			mockEpisode,
			{ ...mockEpisode, id: 2, name: 'Sacred Cow' },
		]);
		render(<Episodes />);
		await flush();

		expect(screen.getByText('Human Flesh')).toBeVisible();
		expect(screen.getByText('Sacred Cow')).toBeVisible();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search Episodes...'),
			'sacred',
		);

		expect(screen.queryByText('Human Flesh')).toBeNull();
		expect(screen.getByText('Sacred Cow')).toBeVisible();
	});

	it('Filter By only offers Sort, with no category or gender/hair options', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);
		await flush();
		fireEvent.press(screen.getByLabelText('Show filter options'));

		expect(screen.getByLabelText('Tap to sort A to Z')).toBeVisible();
		expect(screen.queryByLabelText('Filter by Characters')).toBeNull();
		expect(screen.queryByLabelText('Filter by gender: Male')).toBeNull();
	});

	it('clears the search query when the screen loses focus', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([
			mockEpisode,
			{ ...mockEpisode, id: 2, name: 'Sacred Cow' },
		]);
		render(<Episodes />);
		await flush();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search Episodes...'),
			'sacred',
		);
		expect(screen.queryByText('Human Flesh')).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(screen.getByPlaceholderText('Search Episodes...').props.value).toBe(
			'',
		);
		expect(screen.getByText('Human Flesh')).toBeVisible();
	});

	it('shows only the first page of episodes, revealing more as the list is scrolled', async () => {
		const manyEpisodes = Array.from({ length: 25 }, (_, i) => ({
			...mockEpisode,
			id: i,
			name: `Episode Number ${i}`,
		}));
		(getEpisodes as jest.Mock).mockResolvedValue(manyEpisodes);

		render(<Episodes />);
		await flush();

		expect(screen.getByText('Episode Number 0')).toBeVisible();
		expect(screen.getByText('Episode Number 19')).toBeVisible();
		expect(screen.queryByText('Episode Number 20')).toBeNull();
		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(20);

		act(() => {
			screen.UNSAFE_getByType(FlatList).props.onEndReached();
		});

		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(25);
	});
});
