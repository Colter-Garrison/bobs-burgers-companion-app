import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCategoryData } from './useCategoryData';

describe('useCategoryData', () => {
	it('starts loading, then resolves to the fetched data', async () => {
		const fetchFn = jest.fn().mockResolvedValue([{ id: 1 }]);

		const { result } = renderHook(() => useCategoryData(fetchFn));

		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.data).toEqual([{ id: 1 }]);
		expect(result.current.error).toBeNull();
	});

	it('exposes the error message and empty data when the fetch fails', async () => {
		const fetchFn = jest.fn().mockRejectedValue(new Error('network down'));

		const { result } = renderHook(() => useCategoryData(fetchFn));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBe('network down');
	});

	it('retry re-runs the fetch and can recover from a prior failure', async () => {
		const fetchFn = jest
			.fn()
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([{ id: 1 }]);

		const { result } = renderHook(() => useCategoryData(fetchFn));
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
