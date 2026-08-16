import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Episodes from './episodes';
import { getEpisodes } from '../hooks/fetchEpisodes';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/fetchEpisodes');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

const mockEpisode = {
	id: 1,
	name: 'Human Flesh',
	description: "It's a pilot episode.",
	productionCode: '1ASA01',
	airDate: '2011-01-09',
	season: 1,
	episode: 1,
	totalViewers: '9.02 million',
	url: '',
	wikiUrl: 'https://wiki/human-flesh',
};

async function flush() {
	await act(async () => {
		await Promise.resolve();
	});
}

describe('Episodes screen', () => {
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

	it('shows a skeleton while loading, then the episode list', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();

		await flush();

		expect(screen.getByText('Name: Human Flesh')).toBeVisible();
		expect(
			screen.getByText("Description: It's a pilot episode."),
		).toBeVisible();
		expect(screen.getByText('Air Date: 2011-01-09')).toBeVisible();
		expect(screen.getByText('Season: 1')).toBeVisible();
		expect(screen.getByText('Episode: 1')).toBeVisible();
		expect(screen.getByText('Total Viewers: 9.02 million')).toBeVisible();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([]);
		render(<Episodes />);
		await flush();
		expect(screen.getByText('Episode UH OH...')).toBeVisible();
	});

	it('opens the wiki URL when an episode card is pressed', async () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);
		await flush();

		fireEvent.press(screen.getByText('Name: Human Flesh'));

		expect(openURLSpy).toHaveBeenCalledWith('https://wiki/human-flesh');
	});

	it('tapping the favorite star calls addFavorite with the episode category and id, not the wiki link', async () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);
		await flush();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('episode', 1);
		expect(openURLSpy).not.toHaveBeenCalled();
	});

	it('shows an error state with a working retry when the fetch fails', async () => {
		(getEpisodes as jest.Mock)
			.mockRejectedValueOnce(new Error('network down'))
			.mockResolvedValueOnce([mockEpisode]);

		render(<Episodes />);
		await flush();

		expect(screen.getByText('network down')).toBeVisible();

		await act(async () => {
			fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
			await Promise.resolve();
		});

		expect(getEpisodes).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Name: Human Flesh')).toBeVisible();
	});
});
