import { getStoresNextDoor } from './fetchStoresNextDoor';

describe('getStoresNextDoor', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('calls the correct URL and returns the parsed stores', async () => {
		const mockStores = [{ id: 1, name: 'Test Store', image: 'https://img' }];
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			json: async () => mockStores,
		});

		const result = await getStoresNextDoor();

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/storeNextDoor/',
		);
		expect(result).toEqual(mockStores);
	});

	it('returns an empty array when the fetch fails', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		const result = await getStoresNextDoor();

		expect(result).toEqual([]);
	});
});
