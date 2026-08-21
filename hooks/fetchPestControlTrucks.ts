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

function fixImageUrl(image: string): string {
	return image.replace(
		'/images/pestControlTrucks/',
		'/images/pestControlTruck/',
	);
}

export const getPestControlTrucks = async () => {
	const trucks = await fetchBobsBurgersApi<Truck[]>('/pestControlTruck/');
	return trucks.map((truck) => ({
		...truck,
		image: truck.image ? fixImageUrl(truck.image) : truck.image,
	}));
};

export const getPestControlTruckById = async (id: number) => {
	const truck = await fetchBobsBurgersApi<Truck>(`/pestControlTruck/${id}`);
	return {
		...truck,
		image: truck.image ? fixImageUrl(truck.image) : truck.image,
	};
};
