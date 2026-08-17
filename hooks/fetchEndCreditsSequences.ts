import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

export interface EndCredit {
	id: number;
	image: string;
	season: number;
	episode: number;
	episodeUrl: string;
	url: string;
}

export const getEndCreditsSequences = () =>
	fetchBobsBurgersApi<EndCredit[]>('/endCreditsSequence/');

export const getEndCreditsSequenceById = (id: number) =>
	fetchBobsBurgersApi<EndCredit>(`/endCreditsSequence/${id}`);
