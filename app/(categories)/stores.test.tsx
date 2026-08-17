import { Image } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Stores from './stores';
import { getStoresNextDoor } from '../../hooks/fetchStoresNextDoor';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/fetchStoresNextDoor');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('Stores screen', () => {
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
		(getStoresNextDoor as jest.Mock).mockResolvedValue([]);
		render(<Stores />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();
	});

	it('shows the name and a bio blurb, with an image when one is provided', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Store',
				image: 'https://img/1.png',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<Stores />);
		await flush();

		expect(screen.getByText('Test Store')).toBeVisible();
		expect(
			screen.getByText(
				'One of the ever-changing stores next door, seen in Season 1, Episode 2.',
			),
		).toBeVisible();
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull();
	});

	it('omits the image entirely when the item has none', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Store',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<Stores />);
		await flush();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([]);
		render(<Stores />);
		await flush();
		expect(screen.getByText('Store Next Door UH OH...')).toBeVisible();
	});

	it('navigates to the detail page when a card is pressed', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Store',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<Stores />);
		await flush();

		fireEvent.press(screen.getByText('Test Store'));

		expect(mockPush).toHaveBeenCalledWith({
			pathname: '/detail/[category]/[id]',
			params: { category: 'stores', id: '1' },
		});
	});

	it('tapping the favorite star calls addFavorite with the store category and id', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Store',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<Stores />);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('store', 1);
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getStoresNextDoor as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([
				{
					id: 1,
					name: 'Test Store',
					image: '',
					season: 1,
					episode: 2,
					episodeUrl: '',
				},
			]);

		render(<Stores />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getStoresNextDoor).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Test Store')).toBeVisible();
	});
});
