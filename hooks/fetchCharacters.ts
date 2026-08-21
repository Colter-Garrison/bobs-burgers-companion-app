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
