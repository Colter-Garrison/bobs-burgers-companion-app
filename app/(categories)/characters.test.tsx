import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import Characters from './characters';
import { getCharacters } from '../../hooks/fetchCharacters';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/fetchCharacters');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

// See app/index.test.tsx's identical mock for why this is needed: a bare
// RNTL render has no real navigation container, and characters.tsx now
// calls useFocusEffect to clear its search query/filters on blur.
let focusEffectCleanup: (() => void) | undefined;
jest.mock('@react-navigation/native', () => ({
	useFocusEffect: (callback: () => void | (() => void)) => {
		focusEffectCleanup = callback() ?? undefined;
	},
}));

const baseCharacter = {
	id: 1,
	name: 'Bob Belcher',
	relatives: [],
	wikiUrl: 'https://wiki/bob',
	image: '',
	gender: 'Male',
	hair: '',
	age: null,
	nicknames: [],
	occupation: '',
	allOccupations: [],
	firstEpisode: 'Human Flesh',
	voicedBy: '',
	url: '',
};

async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('Characters screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();
	const mockPush = jest.fn();

	beforeEach(() => {
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
		(getCharacters as jest.Mock).mockResolvedValue([]);
		render(<Characters />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([]);
		render(<Characters />);
		await flush();
		expect(screen.getByText('Character UH OH...')).toBeVisible();
	});

	it('shows the name and a bio blurb assembled from the sparse fields available', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flush();

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(
			screen.getByText(
				"Bob Belcher is a regular in the Bob's Burgers world. First appeared in Human Flesh.",
			),
		).toBeVisible();
	});

	it('includes relatives, occupation, and voice actor in the blurb when present', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([
			{
				...baseCharacter,
				relatives: [
					{ name: 'Linda Belcher', relationship: 'wife', wikiUrl: '', url: '' },
				],
				occupation: 'Restaurateur',
				voicedBy: 'H. Jon Benjamin',
			},
		]);
		render(<Characters />);
		await flush();

		expect(
			screen.getByText(
				'Bob Belcher is a Restaurateur. First appeared in Human Flesh. Related to Linda Belcher (wife). Voiced by H. Jon Benjamin.',
			),
		).toBeVisible();
	});

	it('navigates to the detail page (not the external wiki link) when a character card is pressed', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flush();

		fireEvent.press(screen.getByText('Bob Belcher'));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: '/detail/[category]/[id]',
			params: { category: 'characters', id: '1' },
		});
	});

	it('tapping the favorite star calls addFavorite with the character category and id, not navigation', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('character', 1);
		expect(mockPush).not.toHaveBeenCalled();
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getCharacters as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([baseCharacter]);

		render(<Characters />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getCharacters).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Bob Belcher')).toBeVisible();
	});

	it('search bar narrows the list to characters matching the query', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([
			baseCharacter,
			{ ...baseCharacter, id: 2, name: 'Linda Belcher' },
		]);
		render(<Characters />);
		await flush();

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText('Linda Belcher')).toBeVisible();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search Characters...'),
			'linda',
		);

		expect(screen.queryByText('Bob Belcher')).toBeNull();
		expect(screen.getByText('Linda Belcher')).toBeVisible();
	});

	it('Filter By shows Gender and Hair Color, with no category picker', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([
			baseCharacter,
			{ ...baseCharacter, id: 2, name: 'Linda Belcher', gender: 'Female' },
		]);
		render(<Characters />);
		await flush();
		fireEvent.press(screen.getByLabelText('Show filter options'));

		expect(screen.queryByLabelText('Filter by Characters')).toBeNull();
		expect(screen.getByLabelText('Filter by gender: Male')).toBeVisible();
		expect(screen.getByLabelText('Filter by hair color: Blonde')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Filter by gender: Female'));

		expect(screen.queryByText('Bob Belcher')).toBeNull();
		expect(screen.getByText('Linda Belcher')).toBeVisible();
	});

	it('clears the search query and filters when the screen loses focus', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([
			baseCharacter,
			{ ...baseCharacter, id: 2, name: 'Linda Belcher' },
		]);
		render(<Characters />);
		await flush();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search Characters...'),
			'linda',
		);
		expect(screen.queryByText('Bob Belcher')).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(
			screen.getByPlaceholderText('Search Characters...').props.value,
		).toBe('');
		expect(screen.getByText('Bob Belcher')).toBeVisible();
	});

	it('shows only the first page of characters, revealing more as the list is scrolled', async () => {
		const manyCharacters = Array.from({ length: 25 }, (_, i) => ({
			...baseCharacter,
			id: i,
			name: `Character Number ${i}`,
		}));
		(getCharacters as jest.Mock).mockResolvedValue(manyCharacters);

		render(<Characters />);
		await flush();

		expect(screen.getByText('Character Number 0')).toBeVisible();
		expect(screen.getByText('Character Number 19')).toBeVisible();
		expect(screen.queryByText('Character Number 20')).toBeNull();
		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(20);

		act(() => {
			screen.UNSAFE_getByType(FlatList).props.onEndReached();
		});

		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(25);
	});
});
