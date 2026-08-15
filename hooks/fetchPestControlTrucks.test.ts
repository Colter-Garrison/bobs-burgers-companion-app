import { getPestControlTrucks } from './fetchPestControlTrucks';

describe('getPestControlTrucks', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('calls the correct URL and returns the parsed trucks', async () => {
		const mockTrucks = [{ id: 1, name: 'Test Truck', image: 'https://img' }];
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			json: async () => mockTrucks,
		});

		const result = await getPestControlTrucks();

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/pestControlTruck/',
		);
		expect(result).toEqual(mockTrucks);
	});

	it('returns an empty array when the fetch fails', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		const result = await getPestControlTrucks();

		expect(result).toEqual([]);
	});
});
