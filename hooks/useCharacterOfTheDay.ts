import { useMemo } from 'react';
import {
	getLocalDateKey,
	pickCharacterOfTheDay,
} from '../lib/characterOfTheDay';
import { composeCharacterShortBio } from '../lib/categoryBio';
import { getCharacters } from './fetchCharacters';
import { useCategoryData } from './useCategoryData';

// Reuses the exact same cached/offline-aware fetch as the Characters
// screen (same cacheKey: 'characters') — so if that screen has ever
// loaded successfully, Home's card can show instantly from the shared
// cache instead of waiting on its own fetch, and works offline too.
export function useCharacterOfTheDay() {
	const { data: characters } = useCategoryData(getCharacters, 'characters');

	const character = useMemo(
		() => pickCharacterOfTheDay(characters, getLocalDateKey()),
		[characters],
	);

	const blurb = useMemo(
		() => (character ? composeCharacterShortBio(character) : null),
		[character],
	);

	return { character, blurb };
}
