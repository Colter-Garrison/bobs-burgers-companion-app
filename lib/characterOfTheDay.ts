// Pure logic for the Home screen's "Character of the Day" card — kept
// framework-free (no React) so the date math and blurb wording can be
// tested directly, without rendering anything.
import { Character } from '../hooks/fetchCharacters';

// Local (device) date, not UTC — "today" should change at the user's own
// midnight, not Greenwich's.
export function getLocalDateKey(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

// The classic Java String.hashCode algorithm — not cryptographic, just
// well-distributed enough that consecutive dates don't cluster near one
// end of the character list the way summing char codes would (dates are
// mostly digits and dashes, a narrow range of char codes).
function hashString(value: string): number {
	let hash = 0;
	for (let i = 0; i < value.length; i++) {
		hash = (hash * 31 + value.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

// Deterministic on (list, date) — the same date always picks the same
// character out of the same list, so every user sees the same "Character
// of the Day" without any server-side coordination.
export function pickCharacterOfTheDay<T>(
	items: T[],
	dateKey: string,
): T | null {
	if (items.length === 0) return null;
	const index = hashString(dateKey) % items.length;
	return items[index];
}

function startsWithVowelSound(word: string): boolean {
	return /^[aeiou]/i.test(word);
}

// Composes a short bio from the character's own API fields — no AI, no
// external call, just real data assembled into readable sentences.
// Every clause is independently optional since minor characters are
// often missing most of these fields (see lib/characterOfTheDay.test.ts
// for the sparse-data cases this guards against).
export function composeCharacterBlurb(character: Character): string {
	const sentences: string[] = [];

	const occupation = character.occupation || character.allOccupations?.[0];
	sentences.push(
		occupation
			? `${character.name} is ${startsWithVowelSound(occupation) ? 'an' : 'a'} ${occupation}.`
			: `${character.name} is a regular in the Bob's Burgers world.`,
	);

	if (character.firstEpisode) {
		sentences.push(`First appeared in ${character.firstEpisode}.`);
	}

	if (character.relatives && character.relatives.length > 0) {
		// Capped at 3 — some characters (the Belchers especially) have long
		// enough relative lists that listing all of them would dwarf the
		// rest of the blurb.
		const names = character.relatives
			.slice(0, 3)
			.map((relative) =>
				relative.relationship
					? `${relative.name} (${relative.relationship})`
					: relative.name,
			)
			.join(', ');
		sentences.push(`Related to ${names}.`);
	}

	if (character.voicedBy) {
		sentences.push(`Voiced by ${character.voicedBy}.`);
	}

	return sentences.join(' ');
}
