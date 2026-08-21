// Local (device) date, not UTC — "today" should change at the user's own
// midnight, not Greenwich's.
export function getLocalDateKey(date: Date = new Date()): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

// The classic Java String.hashCode algorithm — not cryptographic, just
// well-distributed enough that consecutive dates don't cluster near one
// end of the character list the way summing char codes would (dates are
// mostly digits and dashes, a narrow range of char codes).
function hashString(value: string): number {
	let hash = 0
	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

// Deterministic on (list, date) — the same date always picks the same
// character out of the same list, so every user sees the same "Character
// of the Day" without any server-side coordination.
export function pickCharacterOfTheDay<T>(
	items: T[],
	dateKey: string,
): T | null {
	if (items.length === 0) return null
	const index = hashString(dateKey) % items.length
	return items[index]
}
