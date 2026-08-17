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

// The API's own `image` field points at a path that 404s — it uses the
// plural "pestControlTrucks", but the files actually live under the
// singular "pestControlTruck" (matching the endpoint's own path). This
// rewrites the URL to the one that actually resolves. Confirmed via
// direct requests: /images/pestControlTrucks/1.jpg -> 404,
// /images/pestControlTruck/1.jpg -> 200.
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
