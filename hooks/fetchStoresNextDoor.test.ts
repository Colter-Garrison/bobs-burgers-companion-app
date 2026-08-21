import { getStoresNextDoor } from './fetchStoresNextDoor'
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi'

jest.mock('../lib/bobsBurgersApi')

describe('getStoresNextDoor', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('requests the correct path and returns the result', async () => {
		const mockStores = [{ id: 1, name: 'Test Store', image: 'https://img' }]
		;(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockStores)

		const result = await getStoresNextDoor()

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith('/storeNextDoor/')
		expect(result).toEqual(mockStores)
	})
})
