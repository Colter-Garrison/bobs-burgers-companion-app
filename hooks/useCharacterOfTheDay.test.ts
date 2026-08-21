import { renderHook, waitFor } from '@testing-library/react-native'
import { useCharacterOfTheDay } from './useCharacterOfTheDay'
import { getCharacters } from './fetchCharacters'

jest.mock('./fetchCharacters')

describe('useCharacterOfTheDay', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('returns a character and a matching blurb once the character list loads', async () => {
		;(getCharacters as jest.Mock).mockResolvedValue([
			{
				id: 1,
				name: 'Bob Belcher',
				relatives: [],
				wikiUrl: 'https://wiki',
				image: 'https://img',
				gender: 'Male',
				hair: 'Black',
				occupation: "Owner of Bob's Burgers",
				allOccupations: [],
				firstEpisode: '',
				voicedBy: '',
				url: 'https://url',
			},
		])

		const { result } = renderHook(() => useCharacterOfTheDay())

		await waitFor(() => expect(result.current.character).not.toBeNull())

		expect(result.current.character?.name).toBe('Bob Belcher')
		expect(result.current.blurb).toContain('Bob Belcher')
	})

	it('returns null character and blurb while there is nothing to pick from yet', () => {
		;(getCharacters as jest.Mock).mockReturnValue(new Promise(() => {})) // never resolves

		const { result } = renderHook(() => useCharacterOfTheDay())

		expect(result.current.character).toBeNull()
		expect(result.current.blurb).toBeNull()
	})
})
