import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Characters from './characters';
import { getCharacters } from '../hooks/fetchCharacters';

jest.mock('../hooks/fetchCharacters');

const baseCharacter = {
	id: 1,
	name: 'Bob Belcher',
	relatives: [],
	wikiUrl: 'https://wiki/bob',
	image: '',
	gender: 'Male',
	hair: '',
	occupation: '',
	allOccupations: [],
	firstEpisode: 'Human Flesh',
	voicedBy: '',
	url: '',
};

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('Characters screen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([]);
		render(<Characters />);
		await flushAndAdvance();
		expect(screen.getByText('Character UH OH...')).toBeVisible();
	});

	it('shows "None"/"Unknown" fallback text when relatives/occupation/voicedBy are empty', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flushAndAdvance();

		expect(screen.getByText('Name: Bob Belcher')).toBeVisible();
		expect(screen.getByText('Relatives: None')).toBeVisible();
		expect(screen.getByText('Occupation: None')).toBeVisible();
		expect(screen.getByText('Voiced By: Unknown')).toBeVisible();
		expect(screen.getByText('First Episode: Human Flesh')).toBeVisible();
	});

	it('shows real values instead of fallbacks when relatives/occupation/voicedBy are present', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([
			{
				...baseCharacter,
				relatives: [
					{ name: 'Linda Belcher', relationship: 'Wife', wikiUrl: '', url: '' },
				],
				occupation: 'Restaurateur',
				voicedBy: 'H. Jon Benjamin',
			},
		]);
		render(<Characters />);
		await flushAndAdvance();

		expect(screen.getByText('Relatives: Linda Belcher')).toBeVisible();
		expect(screen.getByText('Occupation: Restaurateur')).toBeVisible();
		expect(screen.getByText('Voiced By: H. Jon Benjamin')).toBeVisible();
	});

	it('opens the wiki URL when a character card is pressed', async () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flushAndAdvance();

		fireEvent.press(screen.getByText('Name: Bob Belcher'));

		expect(openURLSpy).toHaveBeenCalledWith('https://wiki/bob');
	});
});
