import { getPestControlTrucks } from './fetchPestControlTrucks';
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

jest.mock('../lib/bobsBurgersApi');

describe('getPestControlTrucks', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('requests the correct path and returns the result', async () => {
		const mockTrucks = [{ id: 1, name: 'Test Truck', image: 'https://img' }];
		(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockTrucks);

		const result = await getPestControlTrucks();

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith('/pestControlTruck/');
		expect(result).toEqual(mockTrucks);
	});
});
