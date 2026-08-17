import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

export interface CharacterRelative {
	name: string;
	relationship: string;
	wikiUrl: string;
	url: string;
}

export interface Character {
	id: number;
	name: string;
	relatives: CharacterRelative[];
	wikiUrl: string;
	image: string;
	gender: string;
	hair: string;
	// The raw API also returns these, but nothing used them until the
	// detail page (app/detail/[category]/[id].tsx) wanted as much real
	// data as it could show — both can be null for minor characters.
	age: string | null;
	nicknames: string[];
	occupation: string;
	allOccupations: string[];
	firstEpisode: string;
	voicedBy: string;
	url: string;
}

export const getCharacters = () =>
	fetchBobsBurgersApi<Character[]>('/characters?sortBy=name&OrderBy=asc');

export const getCharacterById = (id: number) =>
	fetchBobsBurgersApi<Character>(`/characters/${id}`);
