export const getCharacters = async () => {
	try {
		const response = await fetch(
			'https://bobsburgers-api.herokuapp.com/characters?sortBy=name&OrderBy=asc'
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching characters:', error);
	}
};
