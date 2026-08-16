import { Image } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import EndCredits from './endCredits';
import { getEndCreditsSequences } from '../hooks/fetchEndCreditsSequences';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/fetchEndCreditsSequences');
jest.mock('../hooks/useFavorites');
jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('EndCredits screen', () => {
	const mockAddFavorite = jest.fn();
	const mockRemoveFavorite = jest.fn();

	beforeEach(() => {
		jest.useFakeTimers();
		(useFavorites as jest.Mock).mockReturnValue({
			isFavorited: () => false,
			addFavorite: mockAddFavorite,
			removeFavorite: mockRemoveFavorite,
		});
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
		jest.clearAllMocks();
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

	it('tapping the favorite star calls addFavorite with the end_credit category and id', async () => {
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{ id: 1, image: '', season: 1, episode: 2, episodeUrl: '' },
		]);
		render(<EndCredits />);
		await flushAndAdvance();

		fireEvent.press(screen.getByLabelText('Add to favorites'));

		expect(mockAddFavorite).toHaveBeenCalledWith('end_credit', 1);
	});
});
