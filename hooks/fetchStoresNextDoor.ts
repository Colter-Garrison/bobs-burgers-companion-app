import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

export interface Store {
	id: number;
	name: string;
	image: string;
	season: number;
	episode: number;
	episodeUrl: string;
	url: string;
}

export const getStoresNextDoor = () =>
	fetchBobsBurgersApi<Store[]>('/storeNextDoor/');

export const getStoreNextDoorById = (id: number) =>
	fetchBobsBurgersApi<Store>(`/storeNextDoor/${id}`);
