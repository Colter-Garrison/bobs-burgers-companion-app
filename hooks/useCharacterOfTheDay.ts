import { useMemo } from 'react';
import {
	composeCharacterBlurb,
	getLocalDateKey,
	pickCharacterOfTheDay,
} from '../lib/characterOfTheDay';
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
		() => (character ? composeCharacterBlurb(character) : null),
		[character],
	);

	return { character, blurb };
}
