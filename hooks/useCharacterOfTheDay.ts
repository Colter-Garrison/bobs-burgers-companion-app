import { useMemo } from 'react'
import {
	getLocalDateKey,
	pickCharacterOfTheDay,
} from '../lib/characterOfTheDay'
import { composeCharacterShortBio } from '../lib/categoryBio'
import { getCharacters } from './fetchCharacters'
import { useCategoryData } from './useCategoryData'

export function useCharacterOfTheDay() {
	const { data: characters } = useCategoryData(getCharacters, 'characters')

	const character = useMemo(
		() => pickCharacterOfTheDay(characters, getLocalDateKey()),
		[characters],
	)

	const blurb = useMemo(
		() => (character ? composeCharacterShortBio(character) : null),
		[character],
	)

	return { character, blurb }
}
