export const getEpisodes = async () => {
	try {
		const response = await fetch(
			'https://bobsburgers-api.herokuapp.com/episodes/'
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching episodes:', error);
	}
};
