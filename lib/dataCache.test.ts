import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadFromCache, saveToCache } from './dataCache';

describe('dataCache', () => {
	it('returns null when nothing has been cached for a key', async () => {
		const result = await loadFromCache('missing-key');
		expect(result).toBeNull();
	});

	it('round-trips data through save and load, stamped with a cachedAt time', async () => {
		const before = Date.now();
		await saveToCache('burgers', [{ id: 1, name: 'Test Burger' }]);
		const result =
			await loadFromCache<{ id: number; name: string }[]>('burgers');

		expect(result?.data).toEqual([{ id: 1, name: 'Test Burger' }]);
		expect(result?.cachedAt).toBeGreaterThanOrEqual(before);
	});

	it('keeps different keys independent of each other', async () => {
		await saveToCache('a', [1]);
		await saveToCache('b', [2]);

		expect((await loadFromCache('a'))?.data).toEqual([1]);
		expect((await loadFromCache('b'))?.data).toEqual([2]);
	});

	it('returns null instead of throwing when the stored value is corrupt JSON', async () => {
		// Bypasses saveToCache to write a raw, invalid value directly under
		// the same key prefix dataCache.ts uses internally — simulating
		// corruption that couldn't happen through this module's own API.
		await AsyncStorage.setItem('bbca_cache_broken', 'not valid json{{{');

		const result = await loadFromCache('broken');

		expect(result).toBeNull();
	});

	it('does not throw when the underlying storage write fails', async () => {
		jest
			.spyOn(AsyncStorage, 'setItem')
			.mockRejectedValueOnce(new Error('disk full'));

		await expect(saveToCache('x', [1])).resolves.toBeUndefined();
	});
});
