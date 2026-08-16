import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

export interface Truck {
	id: number;
	name: string;
	image: string;
	season: number;
	episode: number;
	episodeUrl: string;
	url: string;
}

export const getPestControlTrucks = () =>
	fetchBobsBurgersApi<Truck[]>('/pestControlTruck/');
