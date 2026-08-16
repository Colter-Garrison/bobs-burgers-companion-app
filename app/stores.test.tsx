import { Image } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Stores from './stores';
import { getStoresNextDoor } from '../hooks/fetchStoresNextDoor';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/fetchStoresNextDoor');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('Stores screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		jest.useFakeTimers();
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
		});
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	it('shows the store list, with an image when one is provided', async () => {
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
		await flushAndAdvance();

		expect(screen.getByText('Name: Test Store')).toBeVisible();
		expect(screen.getByText('Season: 1')).toBeVisible();
		expect(screen.getByText('Episode: 2')).toBeVisible();
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
		await flushAndAdvance();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([]);
		render(<Stores />);
		await flushAndAdvance();
		expect(screen.getByText('Store Next Door UH OH...')).toBeVisible();
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
		await flushAndAdvance();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('store', 1);
	});
});
