import { Character } from '../hooks/fetchCharacters'
import { Episode } from '../hooks/fetchEpisodes'
import {
	composeBurgerFullBio,
	composeBurgerShortBio,
	composeCharacterFullBio,
	composeCharacterShortBio,
	composeEndCreditFullBio,
	composeEndCreditShortBio,
	composeEpisodeFullBio,
	composeEpisodeShortBio,
	composeStoreFullBio,
	composeStoreShortBio,
	composeTruckFullBio,
	composeTruckShortBio,
	extractEpisodeIdFromUrl,
} from './categoryBio'

function makeCharacter(overrides: Partial<Character> = {}): Character {
	return {
		id: 1,
		name: 'Bob Belcher',
		relatives: [],
		wikiUrl: 'https://wiki',
		image: 'https://img',
		gender: 'Male',
		hair: 'Black',
		age: null,
		nicknames: [],
		occupation: '',
		allOccupations: [],
		firstEpisode: '',
		voicedBy: '',
		url: 'https://url',
		...overrides,
	}
}

function makeEpisode(overrides: Partial<Episode> = {}): Episode {
	return {
		id: 1,
		name: 'Human Flesh',
		description: 'Bob deals with a health inspector.',
		productionCode: '1ASA01',
		airDate: 'January 9, 2011',
		season: 1,
		episode: 1,
		totalViewers: '9.4 million',
		url: 'https://url',
		wikiUrl: 'https://wiki/episode',
		...overrides,
	}
}

describe('extractEpisodeIdFromUrl', () => {
	it('extracts the trailing numeric id from an episode resource URL', () => {
		expect(
			extractEpisodeIdFromUrl(
				'https://bobsburgers-api.herokuapp.com/episodes/42',
			),
		).toBe(42)
	})

	it('returns null when the URL has no trailing number', () => {
		expect(
			extractEpisodeIdFromUrl(
				'https://bobsburgers-api.herokuapp.com/episodes/',
			),
		).toBeNull()
	})
})

describe('composeCharacterShortBio / composeCharacterFullBio', () => {
	it('short bio includes occupation, first episode, relatives, and voice actor', () => {
		const character = makeCharacter({
			name: 'Bob Belcher',
			occupation: "Owner of Bob's Burgers",
			firstEpisode: '"Human Flesh"',
			relatives: [
				{ name: 'Linda Belcher', relationship: 'wife', wikiUrl: '', url: '' },
			],
			voicedBy: 'H. Jon Benjamin',
		})

		const blurb = composeCharacterShortBio(character)

		expect(blurb).toContain("Bob Belcher is an Owner of Bob's Burgers.")
		expect(blurb).toContain('First appeared in "Human Flesh".')
		expect(blurb).toContain('Related to Linda Belcher (wife).')
		expect(blurb).toContain('Voiced by H. Jon Benjamin.')
	})

	it('short bio falls back to a generic line for a very sparse character', () => {
		const character = makeCharacter()
		expect(composeCharacterShortBio(character)).toBe(
			"Bob Belcher is a regular in the Bob's Burgers world.",
		)
	})

	it('short bio caps the relatives list at 3 names', () => {
		const character = makeCharacter({
			relatives: Array.from({ length: 6 }, (_, i) => ({
				name: `Relative ${i}`,
				relationship: '',
				wikiUrl: '',
				url: '',
			})),
		})
		const blurb = composeCharacterShortBio(character)
		expect(blurb).toContain('Relative 0')
		expect(blurb).toContain('Relative 2')
		expect(blurb).not.toContain('Relative 3')
	})

	it('full bio includes gender/age/hair, nicknames, extra occupations, and remaining relatives', () => {
		const character = makeCharacter({
			name: 'Bob Belcher',
			gender: 'Male',
			age: '40s',
			hair: 'Black',
			nicknames: ['Bobby'],
			occupation: "Owner of Bob's Burgers",
			allOccupations: ["Owner of Bob's Burgers", 'Cook'],
			relatives: Array.from({ length: 5 }, (_, i) => ({
				name: `Relative ${i}`,
				relationship: '',
				wikiUrl: '',
				url: '',
			})),
		})

		const bio = composeCharacterFullBio(character)

		expect(bio).toContain('male, around 40s years old, black hair')
		expect(bio).toContain('Also known as Bobby.')
		expect(bio).toContain('also been Cook')
		expect(bio).toContain('Also related to Relative 3, Relative 4.')
	})

	it('full bio omits the nicknames/extra-occupations/extra-relatives sentences when there is nothing to add', () => {
		const character = makeCharacter({ gender: '', hair: '', age: null })
		const bio = composeCharacterFullBio(character)
		expect(bio).toBe(composeCharacterShortBio(character))
	})
})

describe('composeEpisodeShortBio / composeEpisodeFullBio', () => {
	it('short bio uses the description plus season/episode', () => {
		const episode = makeEpisode()
		const bio = composeEpisodeShortBio(episode)
		expect(bio).toContain('Bob deals with a health inspector.')
		expect(bio).toContain('Season 1, Episode 1.')
	})

	it('full bio adds air date, viewers, and production code', () => {
		const episode = makeEpisode()
		const bio = composeEpisodeFullBio(episode)
		expect(bio).toContain('Bob deals with a health inspector.')
		expect(bio).toContain('Originally aired January 9, 2011.')
		expect(bio).toContain('Watched by 9.4 million viewers.')
		expect(bio).toContain('Production code 1ASA01.')
	})

	it('full bio omits optional sentences for missing fields', () => {
		const episode = makeEpisode({
			airDate: '',
			totalViewers: '',
			productionCode: '',
		})
		const bio = composeEpisodeFullBio(episode)
		expect(bio).not.toContain('Originally aired')
		expect(bio).not.toContain('Watched by')
		expect(bio).not.toContain('Production code')
	})
})

describe('composeBurgerShortBio / composeBurgerFullBio', () => {
	const burger = {
		id: 1,
		name: '"NEW BACON-INGS" (Comes with Bacon)',
		price: '$5.95',
		season: 1,
		episode: 1,
		episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/1',
		url: 'https://url',
	}

	it('short bio starts with "Priced at" and mentions price and season/episode, without repeating the name', () => {
		const bio = composeBurgerShortBio(burger)
		expect(bio.startsWith('Priced at')).toBe(true)
		expect(bio).not.toContain('"NEW BACON-INGS" (Comes with Bacon)')
		expect(bio).toContain('$5.95')
		expect(bio).toContain('Season 1, Episode 1')
	})

	it('full bio mentions the episode by name once resolved', () => {
		const episode = makeEpisode({ name: 'Human Flesh' })
		const bio = composeBurgerFullBio(burger, episode)
		expect(bio).toContain('Season 1, Episode 1 ("Human Flesh")')
	})

	it('full bio falls back to season/episode numbers when the episode has not resolved', () => {
		const bio = composeBurgerFullBio(burger, null)
		expect(bio).toContain('Season 1, Episode 1')
		expect(bio).not.toContain('("')
	})
})

describe('composeEndCreditShortBio / composeEndCreditFullBio', () => {
	const endCredit = {
		id: 1,
		image: 'https://img',
		season: 2,
		episode: 3,
		episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/20',
		url: 'https://url',
	}

	it('short bio mentions season/episode', () => {
		expect(composeEndCreditShortBio(endCredit)).toContain('Season 2, Episode 3')
	})

	it('full bio mentions the episode by name once resolved', () => {
		const episode = makeEpisode({ name: 'Bed & Breakfast' })
		expect(composeEndCreditFullBio(endCredit, episode)).toContain(
			'Season 2, Episode 3 ("Bed & Breakfast")',
		)
	})
})

describe('composeTruckShortBio / composeTruckFullBio', () => {
	const truck = {
		id: 1,
		name: "Rat's all Folks! EXTERMINATORS",
		image: 'https://img',
		season: 1,
		episode: 4,
		episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/4',
		url: 'https://url',
	}

	it('short bio mentions season/episode', () => {
		expect(composeTruckShortBio(truck)).toContain('Season 1, Episode 4')
	})

	it('full bio mentions the truck name and the episode by name once resolved', () => {
		const episode = makeEpisode({ name: 'Sacred Cow' })
		const bio = composeTruckFullBio(truck, episode)
		expect(bio).toContain("Rat's all Folks! EXTERMINATORS")
		expect(bio).toContain('Season 1, Episode 4 ("Sacred Cow")')
	})
})

describe('composeStoreShortBio / composeStoreFullBio', () => {
	const store = {
		id: 1,
		name: 'P.F.E.T.A',
		image: 'https://img',
		season: 1,
		episode: 5,
		episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/5',
		url: 'https://url',
	}

	it('short bio mentions season/episode', () => {
		expect(composeStoreShortBio(store)).toContain('Season 1, Episode 5')
	})

	it('full bio mentions the store name and the episode by name once resolved', () => {
		const episode = makeEpisode({ name: 'Sheesh! Cab, Bob?' })
		const bio = composeStoreFullBio(store, episode)
		expect(bio).toContain('P.F.E.T.A')
		expect(bio).toContain('Season 1, Episode 5 ("Sheesh! Cab, Bob?")')
	})
})
