export const getStoresNextDoor = async () => {
	try {
		const response = await fetch(
			'https://bobsburgers-api.herokuapp.com/storeNextDoor/'
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching stores next door:', error);
	}
};
