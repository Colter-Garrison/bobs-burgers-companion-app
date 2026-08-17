import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCategoryData } from './useCategoryData';
import { loadFromCache, saveToCache } from '../lib/dataCache';
import { useNetworkStatus } from './useNetworkStatus';

jest.mock('../lib/dataCache');
jest.mock('./useNetworkStatus');

describe('useCategoryData', () => {
	beforeEach(() => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: false });
		(loadFromCache as jest.Mock).mockResolvedValue(null);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('starts loading, then resolves to the fetched data', async () => {
		const fetchFn = jest.fn().mockResolvedValue([{ id: 1 }]);

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.data).toEqual([{ id: 1 }]);
		expect(result.current.error).toBeNull();
	});

	it('saves a successful fetch to the cache', async () => {
		const fetchFn = jest.fn().mockResolvedValue([{ id: 1 }]);

		renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(saveToCache).toHaveBeenCalled());

		expect(saveToCache).toHaveBeenCalledWith('testKey', [{ id: 1 }]);
	});

	it('exposes the error message and empty data when the fetch fails and there is no cache', async () => {
		const fetchFn = jest.fn().mockRejectedValue(new Error('network down'));

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBe('network down');
	});

	it('falls back to cached data (no hard error) when the fetch fails and a cache exists', async () => {
		const fetchFn = jest.fn().mockRejectedValue(new Error('network down'));
		(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 1 }],
			cachedAt: 123,
		});

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.data).toEqual([{ id: 1 }]);
		expect(result.current.error).toBeNull();
		expect(result.current.cachedAt).toBe(123);
	});

	it('skips the network call entirely when already known to be offline, and uses the cache', async () => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true });
		(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 1 }],
			cachedAt: 456,
		});
		const fetchFn = jest.fn();

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(fetchFn).not.toHaveBeenCalled();
		expect(result.current.data).toEqual([{ id: 1 }]);
		expect(result.current.cachedAt).toBe(456);
	});

	it('shows an error when offline with no cache available', async () => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true });
		const fetchFn = jest.fn();

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(fetchFn).not.toHaveBeenCalled();
		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBeTruthy();
	});

	// Regression coverage: useNetworkStatus's isOffline can get stuck
	// true on web even after the connection is genuinely back (NetInfo's
	// own web event source is unreliable there — see useNetworkStatus.ts).
	// An explicit retry (the OfflineBanner's "Retry" button, or
	// ErrorState's) must never be silently defeated by that.
	it('retry always attempts a real fetch, even while isOffline is (possibly incorrectly) still true', async () => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true });
		(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 1 }],
			cachedAt: 456,
		});
		const fetchFn = jest.fn().mockResolvedValue([{ id: 2 }]);

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(fetchFn).not.toHaveBeenCalled();
		expect(result.current.cachedAt).toBe(456);

		await act(async () => {
			await result.current.retry();
		});

		expect(fetchFn).toHaveBeenCalledTimes(1);
		expect(result.current.data).toEqual([{ id: 2 }]);
		expect(result.current.cachedAt).toBeNull();
	});

	it('automatically re-fetches for real once isOffline flips back to false', async () => {
		(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: true });
		(loadFromCache as jest.Mock).mockResolvedValue({
			data: [{ id: 1 }],
			cachedAt: 456,
		});
		const fetchFn = jest.fn().mockResolvedValue([{ id: 2 }]);

		const { result, rerender } = renderHook(() =>
			useCategoryData(fetchFn, 'testKey'),
		);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(fetchFn).not.toHaveBeenCalled();

		(useNetworkStatus as jest.Mock).mockReturnValue({ isOffline: false });
		rerender({});
		await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));

		expect(result.current.data).toEqual([{ id: 2 }]);
		expect(result.current.cachedAt).toBeNull();
	});

	it('retry re-runs the fetch and can recover from a prior failure', async () => {
		const fetchFn = jest
			.fn()
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([{ id: 1 }]);

		const { result } = renderHook(() => useCategoryData(fetchFn, 'testKey'));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('network down');

		await act(async () => {
			await result.current.retry();
		});

		expect(fetchFn).toHaveBeenCalledTimes(2);
		expect(result.current.error).toBeNull();
		expect(result.current.data).toEqual([{ id: 1 }]);
	});
});
