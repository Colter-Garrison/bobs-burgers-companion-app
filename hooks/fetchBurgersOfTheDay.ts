export const getBurgersOfTheDay = async () => {
	try {
		const response = await fetch(
			'https://bobsburgers-api.herokuapp.com/burgerOfTheDay/'
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching burgers of the day:', error);
	}
};
