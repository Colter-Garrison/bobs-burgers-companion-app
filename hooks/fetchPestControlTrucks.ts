export const getPestControlTrucks = async () => {
	try {
		const response = await fetch(
			'https://bobsburgers-api.herokuapp.com/pestControlTruck/'
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching pest control trucks:', error);
	}
};
