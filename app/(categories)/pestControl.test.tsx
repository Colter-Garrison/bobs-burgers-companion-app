import { FlatList, Image } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import PestControl from './pestControl';
import { getPestControlTrucks } from '../../hooks/fetchPestControlTrucks';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/fetchPestControlTrucks');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

// See app/index.test.tsx's identical mock for why this is needed: a bare
// RNTL render has no real navigation container, and pestControl.tsx now
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

describe('PestControl screen', () => {
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
		(getPestControlTrucks as jest.Mock).mockResolvedValue([]);
		render(<PestControl />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();
	});

	it('shows the name and a bio blurb, with an image when one is provided', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: 'https://img/1.png',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();

		expect(screen.getByText('Test Truck')).toBeVisible();
		expect(
			screen.getByText("Spotted in Season 1, Episode 2 of Bob's Burgers."),
		).toBeVisible();
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull();
	});

	it('omits the image entirely when the item has none', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([]);
		render(<PestControl />);
		await flush();
		expect(screen.getByText('Pest Control Truck UH OH...')).toBeVisible();
	});

	it('navigates to the detail page when a card is pressed', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();

		fireEvent.press(screen.getByText('Test Truck'));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: '/detail/[category]/[id]',
			params: { category: 'pestControl', id: '1' },
		});
	});

	it('tapping the favorite star calls addFavorite with the pest_control_truck category and id', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('pest_control_truck', 1);
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getPestControlTrucks as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([
				{
					id: 1,
					name: 'Test Truck',
					image: '',
					season: 1,
					episode: 2,
					episodeUrl: '',
				},
			]);

		render(<PestControl />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getPestControlTrucks).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Test Truck')).toBeVisible();
	});

	it('search bar narrows the list to trucks matching the query', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
			{
				id: 2,
				name: 'Other Truck',
				image: '',
				season: 1,
				episode: 3,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();

		expect(screen.getByText('Test Truck')).toBeVisible();
		expect(screen.getByText('Other Truck')).toBeVisible();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search Pest Control Trucks...'),
			'test',
		);

		expect(screen.getByText('Test Truck')).toBeVisible();
		expect(screen.queryByText('Other Truck')).toBeNull();
	});

	it('Filter By only offers Sort, with no category or gender/hair options', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();
		fireEvent.press(screen.getByLabelText('Show filter options'));

		expect(screen.getByLabelText('Tap to sort A to Z')).toBeVisible();
		expect(screen.queryByLabelText('Filter by Characters')).toBeNull();
		expect(screen.queryByLabelText('Filter by gender: Male')).toBeNull();
	});

	it('clears the search query when the screen loses focus', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
			{
				id: 2,
				name: 'Other Truck',
				image: '',
				season: 1,
				episode: 3,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flush();

		fireEvent.changeText(
			screen.getByPlaceholderText('Search Pest Control Trucks...'),
			'test',
		);
		expect(screen.queryByText('Other Truck')).toBeNull();

		act(() => {
			focusEffectCleanup?.();
		});

		expect(
			screen.getByPlaceholderText('Search Pest Control Trucks...').props.value,
		).toBe('');
		expect(screen.getByText('Other Truck')).toBeVisible();
	});

	it('shows only the first page of trucks, revealing more as the list is scrolled', async () => {
		const manyTrucks = Array.from({ length: 25 }, (_, i) => ({
			id: i,
			name: `Truck Number ${i}`,
			image: '',
			season: 1,
			episode: 1,
			episodeUrl: '',
		}));
		(getPestControlTrucks as jest.Mock).mockResolvedValue(manyTrucks);

		render(<PestControl />);
		await flush();

		expect(screen.getByText('Truck Number 0')).toBeVisible();
		expect(screen.getByText('Truck Number 19')).toBeVisible();
		expect(screen.queryByText('Truck Number 20')).toBeNull();
		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(20);

		act(() => {
			screen.UNSAFE_getByType(FlatList).props.onEndReached();
		});

		expect(screen.UNSAFE_getByType(FlatList).props.data).toHaveLength(25);
	});
});
