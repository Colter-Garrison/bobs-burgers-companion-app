import { getPestControlTrucks } from './fetchPestControlTrucks';
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

jest.mock('../lib/bobsBurgersApi');

describe('getPestControlTrucks', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('requests the correct path and returns the result', async () => {
		const mockTrucks = [
			{
				id: 1,
				name: 'Test Truck',
				image:
					'https://bobsburgers-api.herokuapp.com/images/pestControlTruck/1.jpg',
			},
		];
		(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockTrucks);

		const result = await getPestControlTrucks();

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith('/pestControlTruck/');
		expect(result).toEqual(mockTrucks);
	});

	it("rewrites the API's broken plural image path to the singular path that actually resolves", async () => {
		const mockTrucks = [
			{
				id: 1,
				name: 'Test Truck',
				image:
					'https://bobsburgers-api.herokuapp.com/images/pestControlTrucks/1.jpg',
			},
		];
		(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockTrucks);

		const result = await getPestControlTrucks();

		expect(result[0].image).toBe(
			'https://bobsburgers-api.herokuapp.com/images/pestControlTruck/1.jpg',
		);
	});

	it('leaves a missing image untouched instead of throwing', async () => {
		const mockTrucks = [{ id: 1, name: 'Test Truck', image: '' }];
		(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockTrucks);

		const result = await getPestControlTrucks();

		expect(result[0].image).toBe('');
	});
});
