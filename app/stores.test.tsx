import { Image } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import Stores from './stores';
import { getStoresNextDoor } from '../hooks/fetchStoresNextDoor';

jest.mock('../hooks/fetchStoresNextDoor');

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('Stores screen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('shows the store list, with an image when one is provided', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Store',
				image: 'https://img/1.png',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<Stores />);
		await flushAndAdvance();

		expect(screen.getByText('Name: Test Store')).toBeVisible();
		expect(screen.getByText('Season: 1')).toBeVisible();
		expect(screen.getByText('Episode: 2')).toBeVisible();
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull();
	});

	it('omits the image entirely when the item has none', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Store',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<Stores />);
		await flushAndAdvance();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getStoresNextDoor as jest.Mock).mockResolvedValue([]);
		render(<Stores />);
		await flushAndAdvance();
		expect(screen.getByText('Store Next Door UH OH...')).toBeVisible();
	});
});
