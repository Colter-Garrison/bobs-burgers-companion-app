import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

export interface Burger {
	id: number;
	name: string;
	price: string;
	season: number;
	episode: number;
	episodeUrl: string;
	url: string;
}

export const getBurgersOfTheDay = () =>
	fetchBobsBurgersApi<Burger[]>('/burgerOfTheDay/');

export const getBurgerOfTheDayById = (id: number) =>
	fetchBobsBurgersApi<Burger>(`/burgerOfTheDay/${id}`);
