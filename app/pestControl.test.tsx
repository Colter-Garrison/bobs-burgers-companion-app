import { Image } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import PestControl from './pestControl';
import { getPestControlTrucks } from '../hooks/fetchPestControlTrucks';

jest.mock('../hooks/fetchPestControlTrucks');

async function flushAndAdvance() {
	await act(async () => {
		await Promise.resolve();
		jest.advanceTimersByTime(3000);
	});
}

describe('PestControl screen', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it('shows the truck list, with an image when one is provided', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: 'https://img/1.png',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flushAndAdvance();

		expect(screen.getByText('Name: Test Truck')).toBeVisible();
		expect(screen.getByText('Season: 1')).toBeVisible();
		expect(screen.getByText('Episode: 2')).toBeVisible();
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull();
	});

	it('omits the image entirely when the item has none', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Test Truck',
				image: '',
				season: 1,
				episode: 2,
				episodeUrl: '',
			},
		]);
		render(<PestControl />);
		await flushAndAdvance();

		expect(screen.UNSAFE_queryByType(Image)).toBeNull();
	});

	it('shows the "UH OH" empty state when there is no data', async () => {
		(getPestControlTrucks as jest.Mock).mockResolvedValue([]);
		render(<PestControl />);
		await flushAndAdvance();
		expect(screen.getByText('Pest Control Truck UH OH...')).toBeVisible();
	});
});
