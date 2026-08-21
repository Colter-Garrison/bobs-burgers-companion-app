import { getLocalDateKey, pickCharacterOfTheDay } from './characterOfTheDay'

describe('getLocalDateKey', () => {
	it('formats a date as YYYY-MM-DD using local (not UTC) fields', () => {
		const date = new Date(2024, 0, 5) // Jan 5, 2024, local time
		expect(getLocalDateKey(date)).toBe('2024-01-05')
	})

	it('pads single-digit months and days', () => {
		const date = new Date(2024, 8, 1) // Sept 1, 2024
		expect(getLocalDateKey(date)).toBe('2024-09-01')
	})
})

describe('pickCharacterOfTheDay', () => {
	it('returns null for an empty list', () => {
		expect(pickCharacterOfTheDay([], '2024-01-05')).toBeNull()
	})

	it('picks the same item for the same date key every time (deterministic)', () => {
		const items = ['a', 'b', 'c', 'd', 'e']
		const first = pickCharacterOfTheDay(items, '2024-01-05')
		const second = pickCharacterOfTheDay(items, '2024-01-05')
		expect(first).toBe(second)
	})

	it('can pick different items for different dates', () => {
		const items = Array.from({ length: 50 }, (_, i) => i)
		const picks = new Set(
			Array.from({ length: 30 }, (_, i) =>
				pickCharacterOfTheDay(
					items,
					`2024-01-${String(i + 1).padStart(2, '0')}`,
				),
			),
		)
		expect(picks.size).toBeGreaterThan(5)
	})

	it('always returns an item actually from the list', () => {
		const items = ['x', 'y', 'z']
		for (let day = 1; day <= 31; day++) {
			const pick = pickCharacterOfTheDay(
				items,
				`2024-03-${String(day).padStart(2, '0')}`,
			)
			expect(items).toContain(pick)
		}
	})
})
