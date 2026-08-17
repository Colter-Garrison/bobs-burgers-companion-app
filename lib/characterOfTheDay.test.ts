import { Character } from '../hooks/fetchCharacters';
import {
	composeCharacterBlurb,
	getLocalDateKey,
	pickCharacterOfTheDay,
} from './characterOfTheDay';

function makeCharacter(overrides: Partial<Character> = {}): Character {
	return {
		id: 1,
		name: 'Bob Belcher',
		relatives: [],
		wikiUrl: 'https://wiki',
		image: 'https://img',
		gender: 'Male',
		hair: 'Black',
		occupation: '',
		allOccupations: [],
		firstEpisode: '',
		voicedBy: '',
		url: 'https://url',
		...overrides,
	};
}

describe('getLocalDateKey', () => {
	it('formats a date as YYYY-MM-DD using local (not UTC) fields', () => {
		const date = new Date(2024, 0, 5); // Jan 5, 2024, local time
		expect(getLocalDateKey(date)).toBe('2024-01-05');
	});

	it('pads single-digit months and days', () => {
		const date = new Date(2024, 8, 1); // Sept 1, 2024
		expect(getLocalDateKey(date)).toBe('2024-09-01');
	});
});

describe('pickCharacterOfTheDay', () => {
	it('returns null for an empty list', () => {
		expect(pickCharacterOfTheDay([], '2024-01-05')).toBeNull();
	});

	it('picks the same item for the same date key every time (deterministic)', () => {
		const items = ['a', 'b', 'c', 'd', 'e'];
		const first = pickCharacterOfTheDay(items, '2024-01-05');
		const second = pickCharacterOfTheDay(items, '2024-01-05');
		expect(first).toBe(second);
	});

	it('can pick different items for different dates', () => {
		const items = Array.from({ length: 50 }, (_, i) => i);
		const picks = new Set(
			Array.from({ length: 30 }, (_, i) =>
				pickCharacterOfTheDay(
					items,
					`2024-01-${String(i + 1).padStart(2, '0')}`,
				),
			),
		);
		// Not every day needs a unique pick, but 30 different dates against
		// 50 items should produce more than just one or two repeats — this
		// guards against a degenerate hash that always lands on the same
		// handful of indices.
		expect(picks.size).toBeGreaterThan(5);
	});

	it('always returns an item actually from the list', () => {
		const items = ['x', 'y', 'z'];
		for (let day = 1; day <= 31; day++) {
			const pick = pickCharacterOfTheDay(
				items,
				`2024-03-${String(day).padStart(2, '0')}`,
			);
			expect(items).toContain(pick);
		}
	});
});

describe('composeCharacterBlurb', () => {
	it('includes occupation, first episode, relatives, and voice actor when all are present', () => {
		const character = makeCharacter({
			name: 'Bob Belcher',
			occupation: "Owner of Bob's Burgers",
			firstEpisode: '"Human Flesh"',
			relatives: [
				{
					name: 'Linda Belcher',
					relationship: 'wife',
					wikiUrl: '',
					url: '',
				},
			],
			voicedBy: 'H. Jon Benjamin',
		});

		const blurb = composeCharacterBlurb(character);

		expect(blurb).toContain("Bob Belcher is an Owner of Bob's Burgers.");
		expect(blurb).toContain('First appeared in "Human Flesh".');
		expect(blurb).toContain('Related to Linda Belcher (wife).');
		expect(blurb).toContain('Voiced by H. Jon Benjamin.');
	});

	it('uses "a" instead of "an" for a consonant-starting occupation', () => {
		const character = makeCharacter({ occupation: 'Student' });
		expect(composeCharacterBlurb(character)).toContain('is a Student.');
	});

	it('falls back to allOccupations[0] when occupation is empty', () => {
		const character = makeCharacter({
			occupation: '',
			allOccupations: ["Manager of Dusty's Feedbag"],
		});
		expect(composeCharacterBlurb(character)).toContain(
			"is a Manager of Dusty's Feedbag.",
		);
	});

	it('falls back to a generic line when no occupation is known at all', () => {
		const character = makeCharacter({ occupation: '', allOccupations: [] });
		expect(composeCharacterBlurb(character)).toContain(
			"Bob Belcher is a regular in the Bob's Burgers world.",
		);
	});

	it('omits the first-episode sentence when firstEpisode is empty', () => {
		const character = makeCharacter({ firstEpisode: '' });
		expect(composeCharacterBlurb(character)).not.toContain('First appeared');
	});

	it('omits the relatives sentence when there are none', () => {
		const character = makeCharacter({ relatives: [] });
		expect(composeCharacterBlurb(character)).not.toContain('Related to');
	});

	it('lists a relative by name alone when relationship is missing', () => {
		const character = makeCharacter({
			relatives: [{ name: 'Teddy', relationship: '', wikiUrl: '', url: '' }],
		});
		expect(composeCharacterBlurb(character)).toContain('Related to Teddy.');
	});

	it('caps the relatives list at 3 names', () => {
		const character = makeCharacter({
			relatives: Array.from({ length: 6 }, (_, i) => ({
				name: `Relative ${i}`,
				relationship: '',
				wikiUrl: '',
				url: '',
			})),
		});
		const blurb = composeCharacterBlurb(character);
		expect(blurb).toContain('Relative 0');
		expect(blurb).toContain('Relative 2');
		expect(blurb).not.toContain('Relative 3');
	});

	it('omits the voiced-by sentence when voicedBy is empty', () => {
		const character = makeCharacter({ voicedBy: '' });
		expect(composeCharacterBlurb(character)).not.toContain('Voiced by');
	});

	it('produces a minimal but still coherent blurb for a very sparse character', () => {
		const character = makeCharacter({
			occupation: '',
			allOccupations: [],
			firstEpisode: '',
			relatives: [],
			voicedBy: '',
		});
		expect(composeCharacterBlurb(character)).toBe(
			"Bob Belcher is a regular in the Bob's Burgers world.",
		);
	});
});
