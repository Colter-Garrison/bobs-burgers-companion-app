import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Burgers from './burgers';
import { getBurgersOfTheDay } from '../hooks/fetchBurgersOfTheDay';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/fetchBurgersOfTheDay');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

describe('Burgers screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		// The screen's `finally` block does
		// setTimeout(() => setLoading(false), 3000) — under real timers a
		// test would have to actually wait 3 real seconds for that to
		// fire. Fake timers swap in a clock we control: nothing runs
		// until we explicitly move it forward.
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

	it('shows the loading state immediately, then the list after 3s', async () => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Test Burger', price: '$6.75', season: 1, episode: 1 },
		]);

		render(<Burgers />);

		expect(screen.getByText(/Loading/)).toBeVisible();

		// act() wraps anything that triggers a React state update so RNTL
		// waits for the resulting re-render before we assert on it.
		// advanceTimersByTime(3000) instantly runs the setTimeout callback
		// scheduled 3000ms out, without any real wall-clock delay.
		await act(async () => {
			// The mocked fetch's promise resolves on a microtask — the
			// component's own `await getBurgersOfTheDay()` needs that
			// microtask to actually flush before it even reaches the
			// setTimeout call in its `finally` block. Without this
			// `await Promise.resolve()`, advanceTimersByTime can run
			// before the timer has been scheduled at all.
			await Promise.resolve();
			jest.advanceTimersByTime(3000);
		});

		expect(screen.getByText('Name: Test Burger')).toBeVisible();
		expect(screen.getByText('Price: $6.75')).toBeVisible();
		expect(screen.queryByText(/Loading/)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([]);

		render(<Burgers />);

		await act(async () => {
			// The mocked fetch's promise resolves on a microtask — the
			// component's own `await getBurgersOfTheDay()` needs that
			// microtask to actually flush before it even reaches the
			// setTimeout call in its `finally` block. Without this
			// `await Promise.resolve()`, advanceTimersByTime can run
			// before the timer has been scheduled at all.
			await Promise.resolve();
			jest.advanceTimersByTime(3000);
		});

		expect(screen.getByText('Burger of the Day UH OH...')).toBeVisible();
	});

	it('tapping the favorite star calls addFavorite with the burger category and id', async () => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Test Burger', price: '$6.75', season: 1, episode: 1 },
		]);

		render(<Burgers />);
		await act(async () => {
			await Promise.resolve();
			jest.advanceTimersByTime(3000);
		});

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('burger', 1);
	});
});
