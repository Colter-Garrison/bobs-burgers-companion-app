import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Episodes from './episodes';
import { getEpisodes } from '../hooks/fetchEpisodes';

jest.mock('../hooks/fetchEpisodes');

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

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('Episodes screen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('shows the loading state, then the episode list', async () => {
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);

		expect(screen.getByText(/Loading/)).toBeVisible();

		await flushAndAdvance();

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
		await flushAndAdvance();
		expect(screen.getByText('Episode UH OH...')).toBeVisible();
	});

	it('opens the wiki URL when an episode card is pressed', async () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(getEpisodes as jest.Mock).mockResolvedValue([mockEpisode]);
		render(<Episodes />);
		await flushAndAdvance();

		fireEvent.press(screen.getByText('Name: Human Flesh'));

		expect(openURLSpy).toHaveBeenCalledWith('https://wiki/human-flesh');
	});
});
