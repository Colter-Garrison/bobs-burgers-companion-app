import { act, renderHook } from '@testing-library/react-native';
import { useAttributeFilters } from './useAttributeFilters';
import { SearchItem } from './useSearchableItems';

function makeCharacter(overrides: Partial<SearchItem>): SearchItem {
	return {
		id: 'character-1',
		category: 'Characters',
		label: 'Test Character',
		itemId: 1,
		favoriteCategory: 'character',
		...overrides,
	};
}

describe('useAttributeFilters', () => {
	it('matches everything when no filters are active', () => {
		const { result } = renderHook(() => useAttributeFilters());
		const item = makeCharacter({ gender: 'Male', hair: 'Brown' });

		expect(result.current.matches(item)).toBe(true);
	});

	describe('gender', () => {
		it('matches items whose gender field contains the selected option, case-insensitively', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleGender('Male'));

			expect(result.current.matches(makeCharacter({ gender: 'Male' }))).toBe(
				true,
			);
			expect(
				result.current.matches(
					makeCharacter({ gender: 'Male (Brom) Female (Eleanor)' }),
				),
			).toBe(true);
			expect(result.current.matches(makeCharacter({ gender: 'Female' }))).toBe(
				false,
			);
		});

		it('does not treat "Female" as a match for "Male" just because it contains that substring', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleGender('Male'));

			expect(result.current.matches(makeCharacter({ gender: 'Female' }))).toBe(
				false,
			);
		});

		it('excludes items with no gender at all once a gender filter is active', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleGender('Male'));

			expect(result.current.matches(makeCharacter({}))).toBe(false);
		});

		it('OR-combines multiple selected genders', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleGender('Male'));
			act(() => result.current.toggleGender('Female'));

			expect(result.current.matches(makeCharacter({ gender: 'Male' }))).toBe(
				true,
			);
			expect(result.current.matches(makeCharacter({ gender: 'Female' }))).toBe(
				true,
			);
		});

		it('toggling the same option twice clears it', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleGender('Male'));
			act(() => result.current.toggleGender('Male'));

			expect(result.current.genders.size).toBe(0);
			expect(result.current.matches(makeCharacter({ gender: 'Female' }))).toBe(
				true,
			);
		});
	});

	describe('hair', () => {
		it('matches both "Blond" and "Blonde" spellings when Blonde is selected', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleHair('Blonde'));

			expect(result.current.matches(makeCharacter({ hair: 'Blond' }))).toBe(
				true,
			);
			expect(result.current.matches(makeCharacter({ hair: 'Blonde' }))).toBe(
				true,
			);
			expect(
				result.current.matches(makeCharacter({ hair: 'Dirty Blonde' })),
			).toBe(true);
		});

		it('"Other" matches hair values that contain none of the named colors', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleHair('Other'));

			expect(
				result.current.matches(makeCharacter({ hair: 'Purple (dyed)' })),
			).toBe(true);
			expect(result.current.matches(makeCharacter({ hair: 'Brown' }))).toBe(
				false,
			);
		});

		it('excludes items with no hair value once a hair filter is active', () => {
			const { result } = renderHook(() => useAttributeFilters());
			act(() => result.current.toggleHair('Brown'));

			expect(result.current.matches(makeCharacter({}))).toBe(false);
		});
	});

	it('AND-combines gender and hair when both are active', () => {
		const { result } = renderHook(() => useAttributeFilters());
		act(() => result.current.toggleGender('Female'));
		act(() => result.current.toggleHair('Red'));

		expect(
			result.current.matches(makeCharacter({ gender: 'Female', hair: 'Red' })),
		).toBe(true);
		expect(
			result.current.matches(makeCharacter({ gender: 'Male', hair: 'Red' })),
		).toBe(false);
		expect(
			result.current.matches(
				makeCharacter({ gender: 'Female', hair: 'Brown' }),
			),
		).toBe(false);
	});

	describe('sortItems', () => {
		const items = [
			makeCharacter({ id: 'c', label: 'Charlie' }),
			makeCharacter({ id: 'a', label: 'Alice' }),
			makeCharacter({ id: 'b', label: 'Bob' }),
		];

		it('leaves order unchanged when no sort direction is active', () => {
			const { result } = renderHook(() => useAttributeFilters());

			expect(result.current.sortItems(items).map((i) => i.label)).toEqual([
				'Charlie',
				'Alice',
				'Bob',
			]);
		});

		it('sorts ascending on the first toggle, descending on the second', () => {
			const { result } = renderHook(() => useAttributeFilters());

			act(() => result.current.toggleSort());
			expect(result.current.sortDirection).toBe('asc');
			expect(result.current.sortItems(items).map((i) => i.label)).toEqual([
				'Alice',
				'Bob',
				'Charlie',
			]);

			act(() => result.current.toggleSort());
			expect(result.current.sortDirection).toBe('desc');
			expect(result.current.sortItems(items).map((i) => i.label)).toEqual([
				'Charlie',
				'Bob',
				'Alice',
			]);
		});
	});

	it('reset clears genders, hair colors, and sort direction together', () => {
		const { result } = renderHook(() => useAttributeFilters());
		act(() => result.current.toggleGender('Male'));
		act(() => result.current.toggleHair('Brown'));
		act(() => result.current.toggleSort());

		act(() => result.current.reset());

		expect(result.current.genders.size).toBe(0);
		expect(result.current.hairColors.size).toBe(0);
		expect(result.current.sortDirection).toBeNull();
		expect(result.current.activeCount).toBe(0);
	});

	it('activeCount reflects genders, hair colors, and an active sort together', () => {
		const { result } = renderHook(() => useAttributeFilters());

		expect(result.current.activeCount).toBe(0);

		act(() => result.current.toggleGender('Male'));
		act(() => result.current.toggleGender('Female'));
		act(() => result.current.toggleHair('Brown'));
		act(() => result.current.toggleSort());

		expect(result.current.activeCount).toBe(4);
	});
});
