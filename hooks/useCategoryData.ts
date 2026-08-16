import { useCallback, useEffect, useState } from 'react';

// Shared by all six category screens (Burgers, Characters, End Credits,
// Episodes, Pest Control Trucks, Stores) — pass the module-level fetch
// function directly (e.g. `useCategoryData(getBurgersOfTheDay)`), not an
// inline wrapper. A fresh inline function would change identity every
// render and re-trigger the fetch effect on every render; the imported
// fetch functions are stable references, so this dependency is safe as-is.
export function useCategoryData<T>(fetchFn: () => Promise<T[]>) {
	const [data, setData] = useState<T[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await fetchFn();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	}, [fetchFn]);

	useEffect(() => {
		load();
	}, [load]);

	return { data, loading, error, retry: load };
}
