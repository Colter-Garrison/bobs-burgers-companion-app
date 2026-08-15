import { act, render, screen } from '@testing-library/react-native';
import Burgers from './burgers';
import { getBurgersOfTheDay } from '../hooks/fetchBurgersOfTheDay';

jest.mock('../hooks/fetchBurgersOfTheDay');

describe('Burgers screen', () => {
	beforeEach(() => {
		// The screen's `finally` block does
		// setTimeout(() => setLoading(false), 3000) — under real timers a
		// test would have to actually wait 3 real seconds for that to
		// fire. Fake timers swap in a clock we control: nothing runs
		// until we explicitly move it forward.
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
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
});
