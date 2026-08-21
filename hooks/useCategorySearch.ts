import { useMemo, useState } from 'react';

export function useCategorySearch<T>(
	items: T[],
	getSearchableText: (item: T) => string,
) {
	const [query, setQuery] = useState('');

	const filteredItems = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return items;
		return items.filter((item) =>
			getSearchableText(item).toLowerCase().includes(trimmed),
		);
	}, [items, query, getSearchableText]);

	return { query, setQuery, filteredItems };
}
