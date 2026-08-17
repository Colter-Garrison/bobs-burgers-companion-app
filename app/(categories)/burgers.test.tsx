import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Burgers from './burgers';
import { getBurgersOfTheDay } from '../../hooks/fetchBurgersOfTheDay';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';

jest.mock('../../hooks/fetchBurgersOfTheDay');
jest.mock('../../hooks/useFavorites');
jest.mock('../../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

describe('Burgers screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
		});
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	it('shows a skeleton while loading, then the list once the fetch resolves', async () => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Test Burger', price: '$6.75', season: 1, episode: 1 },
		]);

		render(<Burgers />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await act(async () => {
			await Promise.resolve();
		});

		expect(screen.getByText('Name: Test Burger')).toBeVisible();
		expect(screen.getByText('Price: $6.75')).toBeVisible();
		expect(screen.queryByTestId('category-skeleton')).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([]);

		render(<Burgers />);
		await act(async () => {
			await Promise.resolve();
		});

		expect(screen.getByText('Burger of the Day UH OH...')).toBeVisible();
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getBurgersOfTheDay as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([
				{ id: 1, name: 'Test Burger', price: '$6.75', season: 1, episode: 1 },
			]);

		render(<Burgers />);
		await act(async () => {
			await Promise.resolve();
		});

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getBurgersOfTheDay).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Name: Test Burger')).toBeVisible();
	});

	it('tapping the favorite star calls addFavorite with the burger category and id', async () => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Test Burger', price: '$6.75', season: 1, episode: 1 },
		]);

		render(<Burgers />);
		await act(async () => {
			await Promise.resolve();
		});

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('burger', 1);
	});
});
