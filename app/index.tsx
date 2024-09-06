import React from 'react';
import { useRouter } from 'expo-router';
import { Button, View } from 'tamagui';

export default function Index() {
	const router = useRouter();

	return (
		<View gap={10} padding={10} flex={1} backgroundColor={'#5D74A6'}>
			<Button
				color={'#E8242F'}
				backgroundColor={'#F8DF24'}
				onPress={() => router.push('/burgers')}
			>
				Burgers of the Day
			</Button>
			<Button
				color={'#E8242F'}
				backgroundColor={'#F8DF24'}
				onPress={() => router.push('/characters')}
			>
				Characters
			</Button>
			<Button
				color={'#E8242F'}
				backgroundColor={'#F8DF24'}
				onPress={() => router.push('/endCredits')}
			>
				End Credits
			</Button>
			<Button
				color={'#E8242F'}
				backgroundColor={'#F8DF24'}
				onPress={() => router.push('/episodes')}
			>
				Episodes
			</Button>
			<Button
				color={'#E8242F'}
				backgroundColor={'#F8DF24'}
				onPress={() => router.push('/pestControl')}
			>
				Pest Control Trucks
			</Button>
			<Button
				color={'#E8242F'}
				backgroundColor={'#F8DF24'}
				onPress={() => router.push('/stores')}
			>
				Stores Next Door
			</Button>
		</View>
	);
}
