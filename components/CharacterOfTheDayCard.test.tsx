import { render, screen } from '@testing-library/react-native';
import { CharacterOfTheDayCard } from './CharacterOfTheDayCard';
import { Character } from '../hooks/fetchCharacters';

const character: Character = {
	id: 1,
	name: 'Bob Belcher',
	relatives: [],
	wikiUrl: 'https://wiki',
	image: 'https://img',
	gender: 'Male',
	hair: 'Black',
	age: null,
	nicknames: [],
	occupation: "Owner of Bob's Burgers",
	allOccupations: [],
	firstEpisode: '',
	voicedBy: '',
	url: 'https://url',
};

describe('CharacterOfTheDayCard', () => {
	it('shows the "Character of the Day" label, the name, and the blurb', () => {
		render(
			<CharacterOfTheDayCard character={character} blurb='A great blurb.' />,
		);

		expect(screen.getByText('Character of the Day')).toBeVisible();
		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText('A great blurb.')).toBeVisible();
	});

	it('renders without an image when the character has none', () => {
		render(
			<CharacterOfTheDayCard
				character={{ ...character, image: '' }}
				blurb='A great blurb.'
			/>,
		);

		expect(screen.getByText('Bob Belcher')).toBeVisible();
	});
});
