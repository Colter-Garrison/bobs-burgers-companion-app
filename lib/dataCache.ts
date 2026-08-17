// A small persisted cache for the Bob's Burgers API's six category
// datasets. This is deliberately not a general-purpose cache — no TTL,
// no eviction — because it's used as a pure fallback (see
// hooks/useCategoryData.ts and hooks/useSearchableItems.ts): the network
// is always tried first, and this is only ever read when that fails.
// Since the underlying data barely changes, there's no staleness policy
// to design here beyond "prefer live data when it's reachable."
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'bbca_cache_';

interface CacheEntry<T> {
	data: T;
	cachedAt: number;
}

export async function saveToCache<T>(key: string, data: T): Promise<void> {
	const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
	try {
		await AsyncStorage.setItem(`${KEY_PREFIX}${key}`, JSON.stringify(entry));
	} catch {
		// Caching is a nice-to-have, not a requirement for the app to
		// function — a full disk or a disabled storage API shouldn't
		// surface as a user-facing error on top of (or instead of) the
		// screen's own real data.
	}
}

export async function loadFromCache<T>(
	key: string,
): Promise<CacheEntry<T> | null> {
	try {
		const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${key}`);
		if (!raw) return null;
		return JSON.parse(raw) as CacheEntry<T>;
	} catch {
		return null;
	}
}
