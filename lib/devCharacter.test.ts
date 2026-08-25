import { getCharacters } from '../hooks/fetchCharacters'
import { GENDER_OPTIONS, HAIR_OPTIONS } from '../hooks/useAttributeFilters'
import {
	DEV_CHARACTER,
	DEV_CHARACTER_ID,
	getCharactersWithDev,
} from './devCharacter'

jest.mock('../hooks/fetchCharacters')

describe('devCharacter', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('DEV_CHARACTER has a valid, filterable gender and hair color', () => {
		expect(GENDER_OPTIONS).toContain(DEV_CHARACTER.gender)
		expect(HAIR_OPTIONS).toContain(DEV_CHARACTER.hair)
	})

	it('DEV_CHARACTER has a renderable image', () => {
		expect(DEV_CHARACTER.image).toEqual(expect.any(String))
		expect(DEV_CHARACTER.image.length).toBeGreaterThan(0)
	})

	it('getCharactersWithDev appends the dev character to whatever the real API returns', async () => {
		;(getCharacters as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Bob Belcher' },
		])

		const result = await getCharactersWithDev()

		expect(result).toHaveLength(2)
		expect(result[0]).toEqual({ id: 1, name: 'Bob Belcher' })
		expect(result[1]).toEqual(DEV_CHARACTER)
		expect(result[1].id).toBe(DEV_CHARACTER_ID)
	})
})
