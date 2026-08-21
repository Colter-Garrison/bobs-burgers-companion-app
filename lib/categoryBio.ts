import { Burger } from '../hooks/fetchBurgersOfTheDay'
import { Character } from '../hooks/fetchCharacters'
import { EndCredit } from '../hooks/fetchEndCreditsSequences'
import { Episode } from '../hooks/fetchEpisodes'
import { Truck } from '../hooks/fetchPestControlTrucks'
import { Store } from '../hooks/fetchStoresNextDoor'

function startsWithVowelSound(word: string): boolean {
	return /^[aeiou]/i.test(word)
}

function episodeClause(
	season: number,
	episode: number,
	associatedEpisode?: Episode | null,
): string {
	return associatedEpisode
		? `Season ${season}, Episode ${episode} ("${associatedEpisode.name}")`
		: `Season ${season}, Episode ${episode}`
}

export function extractEpisodeIdFromUrl(episodeUrl: string): number | null {
	const match = episodeUrl.match(/\/(\d+)\/?$/)
	return match ? Number(match[1]) : null
}

// ---- Characters ----
export function composeCharacterShortBio(character: Character): string {
	const sentences: string[] = []

	const occupation = character.occupation || character.allOccupations?.[0]
	sentences.push(
		occupation
			? `${character.name} is ${startsWithVowelSound(occupation) ? 'an' : 'a'} ${occupation}.`
			: `${character.name} is a regular in the Bob's Burgers world.`,
	)

	if (character.firstEpisode) {
		sentences.push(`First appeared in ${character.firstEpisode}.`)
	}

	if (character.relatives && character.relatives.length > 0) {
		const names = character.relatives
			.slice(0, 3)
			.map((relative) =>
				relative.relationship
					? `${relative.name} (${relative.relationship})`
					: relative.name,
			)
			.join(', ')
		sentences.push(`Related to ${names}.`)
	}

	if (character.voicedBy) {
		sentences.push(`Voiced by ${character.voicedBy}.`)
	}

	return sentences.join(' ')
}

export function composeCharacterFullBio(character: Character): string {
	const sentences: string[] = [composeCharacterShortBio(character)]

	const traits: string[] = []
	if (character.gender) traits.push(character.gender.toLowerCase())
	if (character.age) traits.push(`around ${character.age} years old`)
	if (character.hair) traits.push(`${character.hair.toLowerCase()} hair`)
	if (traits.length > 0) {
		sentences.push(`${character.name} is ${traits.join(', ')}.`)
	}

	if (character.nicknames && character.nicknames.length > 0) {
		sentences.push(`Also known as ${character.nicknames.join(', ')}.`)
	}

	if (character.allOccupations && character.allOccupations.length > 1) {
		sentences.push(
			`Over the course of the show, ${character.name} has also been ${character.allOccupations.slice(1).join(', ')}.`,
		)
	}

	if (character.relatives && character.relatives.length > 3) {
		const remaining = character.relatives
			.slice(3)
			.map((relative) =>
				relative.relationship
					? `${relative.name} (${relative.relationship})`
					: relative.name,
			)
			.join(', ')
		sentences.push(`Also related to ${remaining}.`)
	}

	return sentences.join(' ')
}

// ---- Episodes ----
export function composeEpisodeShortBio(episode: Episode): string {
	const sentences: string[] = []
	if (episode.description) sentences.push(episode.description)
	sentences.push(`Season ${episode.season}, Episode ${episode.episode}.`)
	return sentences.join(' ')
}

export function composeEpisodeFullBio(episode: Episode): string {
	const sentences: string[] = []
	if (episode.description) sentences.push(episode.description)
	sentences.push(`Season ${episode.season}, Episode ${episode.episode}.`)
	if (episode.airDate) sentences.push(`Originally aired ${episode.airDate}.`)
	if (episode.totalViewers) {
		sentences.push(`Watched by ${episode.totalViewers} viewers.`)
	}
	if (episode.productionCode) {
		sentences.push(`Production code ${episode.productionCode}.`)
	}
	return sentences.join(' ')
}

// ---- Burgers of the Day ----
export function composeBurgerShortBio(burger: Burger): string {
	return `Priced at ${burger.price}, it was the Burger of the Day in Season ${burger.season}, Episode ${burger.episode}.`
}

export function composeBurgerFullBio(
	burger: Burger,
	associatedEpisode?: Episode | null,
): string {
	return `${burger.name} is one of Bob's many pun-filled specials, priced at ${burger.price}. It was the Burger of the Day in ${episodeClause(burger.season, burger.episode, associatedEpisode)}.`
}

// ---- End Credits ----
export function composeEndCreditShortBio(endCredit: EndCredit): string {
	return `A hand-drawn end credits sequence from Season ${endCredit.season}, Episode ${endCredit.episode}.`
}

export function composeEndCreditFullBio(
	endCredit: EndCredit,
	associatedEpisode?: Episode | null,
): string {
	return `This end credits sequence aired at the close of ${episodeClause(endCredit.season, endCredit.episode, associatedEpisode)} — one of the many one-off illustrated sequences the show uses to cap off each episode.`
}

// ---- Pest Control Trucks ----
export function composeTruckShortBio(truck: Truck): string {
	return `Spotted in Season ${truck.season}, Episode ${truck.episode} of Bob's Burgers.`
}

export function composeTruckFullBio(
	truck: Truck,
	associatedEpisode?: Episode | null,
): string {
	return `${truck.name} is one of the many pest control trucks glimpsed through the restaurant's window — a recurring sight gag throughout the series. It appeared in ${episodeClause(truck.season, truck.episode, associatedEpisode)}.`
}

// ---- Stores Next Door ----
export function composeStoreShortBio(store: Store): string {
	return `One of the ever-changing stores next door, seen in Season ${store.season}, Episode ${store.episode}.`
}

export function composeStoreFullBio(
	store: Store,
	associatedEpisode?: Episode | null,
): string {
	return `${store.name} is one of the many storefronts that have occupied the space next door to Bob's Burgers over the years — it changes from episode to episode as a running gag. It appeared in ${episodeClause(store.season, store.episode, associatedEpisode)}.`
}
