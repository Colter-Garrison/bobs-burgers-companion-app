import { Image } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import EndCredits from './endCredits';
import { getEndCreditsSequences } from '../hooks/fetchEndCreditsSequences';

jest.mock('../hooks/fetchEndCreditsSequences');

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('EndCredits screen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('shows the season/episode list, with an image when one is provided', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{
				id: 1,
				image: 'https://img/1.png',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<EndCredits />);
		await flushAndAdvance();

		expect(screen.getByText('Season: 1')).toBeVisible();
		expect(screen.getByText('Episode: 2')).toBeVisible();
		// No testID exists on the Image, so UNSAFE_queryByType is the way
		// to assert on a host component by its React type directly.
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull();
	});

	it('omits the image entirely when the item has none', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flushAndAdvance();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([]);
		render(<EndCredits />);
		await flushAndAdvance();
		expect(screen.getByText('End Credits UH OH...')).toBeVisible();
	});
});
