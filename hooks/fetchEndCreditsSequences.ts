export const getEndCreditsSequences = async () => {
	try {
		const response = await fetch(
			'https://bobsburgers-api.herokuapp.com/endCreditsSequence/'
		);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching end credits sequences:', error);
	}
};
