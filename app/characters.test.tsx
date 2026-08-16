import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Characters from './characters';
import { getCharacters } from '../hooks/fetchCharacters';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/fetchCharacters');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

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

async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('Characters screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
		});
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
	});

	afterEach(() => {
		jest.restoreAllMocks();
		jest.clearAllMocks();
	});

	it('shows a skeleton while loading', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([]);
		render(<Characters />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([]);
		render(<Characters />);
		await flush();
		expect(screen.getByText('Character UH OH...')).toBeVisible();
	});

	it('shows "None"/"Unknown" fallback text when relatives/occupation/voicedBy are empty', async () => {
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flush();

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
		await flush();

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
		await flush();

		fireEvent.press(screen.getByText('Name: Bob Belcher'));

		expect(openURLSpy).toHaveBeenCalledWith('https://wiki/bob');
	});

	it('tapping the favorite star calls addFavorite with the character category and id, not the wiki link', async () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(getCharacters as jest.Mock).mockResolvedValue([baseCharacter]);
		render(<Characters />);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('character', 1);
		expect(openURLSpy).not.toHaveBeenCalled();
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getCharacters as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([baseCharacter]);

		render(<Characters />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getCharacters).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Name: Bob Belcher')).toBeVisible();
	});
});
