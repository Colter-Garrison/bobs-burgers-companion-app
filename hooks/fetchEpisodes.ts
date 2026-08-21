import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi'

export interface Episode {
	id: number
	name: string
	description: string
	productionCode: string
	airDate: string
	season: number
	episode: number
	totalViewers: string
	url: string
	wikiUrl: string
}

export const getEpisodes = () => fetchBobsBurgersApi<Episode[]>('/episodes/')

export const getEpisodeById = (id: number) =>
	fetchBobsBurgersApi<Episode>(`/episodes/${id}`)
