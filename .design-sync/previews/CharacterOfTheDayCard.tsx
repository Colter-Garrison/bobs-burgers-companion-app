import React from 'react'
import { CharacterOfTheDayCard } from 'bobs-burgers-components'

// Home's featured character: label, image, name and a short blurb.
export const Default = () => (
	<CharacterOfTheDayCard
		character={{
			id: 65,
			name: 'Bryce',
			image: 'https://bobsburgers-api.herokuapp.com/images/characters/65.jpg',
			relatives: [],
			wikiUrl: 'https://bobs-burgers.fandom.com/wiki/Bryce',
			gender: 'Male',
			hair: 'Ginger',
			age: null,
			nicknames: [],
			occupation: 'High school student',
			allOccupations: ['High school student'],
			firstEpisode: '"Full Bars"',
			voicedBy: 'Joe Lo Truglio',
			url: 'https://bobsburgers-api.herokuapp.com/characters/65',
		}}
		blurb='Bryce is a High school student. First appeared in "Full Bars". Voiced by Joe Lo Truglio.'
	/>
)
