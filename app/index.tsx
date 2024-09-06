import React from 'react';
import { useRouter } from 'expo-router';
import { Button, H1, View } from 'tamagui';

export default function Index() {
	const router = useRouter();

	return (
		<View gap={10} padding={10} flex={1} backgroundColor={'#F8DF24'}>
			<Button
				fontSize={20}
				backgroundColor={'#E8242F'}
				onPress={() => router.push('/burgers')}
			>
				Burgers of the Day
			</Button>
			<Button
				fontSize={20}
				backgroundColor={'#E8242F'}
				onPress={() => router.push('/characters')}
			>
				Characters
			</Button>
			<Button
				fontSize={20}
				backgroundColor={'#E8242F'}
				onPress={() => router.push('/endCredits')}
			>
				End Credits
			</Button>
			<Button
				fontSize={20}
				backgroundColor={'#E8242F'}
				onPress={() => router.push('/episodes')}
			>
				Episodes
			</Button>
			<Button
				fontSize={20}
				backgroundColor={'#E8242F'}
				onPress={() => router.push('/pestControl')}
			>
				Pest Control Trucks
			</Button>
			<Button
				fontSize={20}
				backgroundColor={'#E8242F'}
				onPress={() => router.push('/stores')}
			>
				Stores Next Door
			</Button>
		</View>
	);
}
