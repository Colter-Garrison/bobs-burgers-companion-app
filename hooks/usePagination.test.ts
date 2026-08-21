import { act, renderHook } from '@testing-library/react-native';
import { usePagination } from './usePagination';

function makeItems(count: number) {
	return Array.from({ length: count }, (_, i) => i);
}

describe('usePagination', () => {
	it('shows only the first page (20 items) initially', () => {
		const { result } = renderHook(() => usePagination(makeItems(45)));

		expect(result.current.visibleItems).toHaveLength(20);
		expect(result.current.visibleItems).toEqual(makeItems(20));
		expect(result.current.hasMore).toBe(true);
	});

	it('reveals another page each time loadMore is called, capped at the list length', () => {
		const items = makeItems(45);
		const { result } = renderHook(() => usePagination(items));

		act(() => result.current.loadMore());
		expect(result.current.visibleItems).toHaveLength(40);

		act(() => result.current.loadMore());
		expect(result.current.visibleItems).toHaveLength(45);
		expect(result.current.hasMore).toBe(false);

		act(() => result.current.loadMore());
		expect(result.current.visibleItems).toHaveLength(45);
	});

	it('does not paginate at all when the list is shorter than one page', () => {
		const { result } = renderHook(() => usePagination(makeItems(5)));

		expect(result.current.visibleItems).toHaveLength(5);
		expect(result.current.hasMore).toBe(false);
	});

	it('resets back to the first page when the underlying list changes', () => {
		const { result, rerender } = renderHook(
			({ items }: { items: number[] }) => usePagination(items),
			{ initialProps: { items: makeItems(45) } },
		);

		act(() => result.current.loadMore());
		expect(result.current.visibleItems).toHaveLength(40);

		rerender({ items: makeItems(8) });

		expect(result.current.visibleItems).toHaveLength(8);
		expect(result.current.hasMore).toBe(false);
	});
});
