import React from 'react';
import { useRouter } from 'expo-router';
import { Button, Input, Text, View, XStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
	const router = useRouter();

	return (
		<View gap={10} padding={10} flex={1} backgroundColor={'#BDFB73'}>
			<Button
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
				onPress={() => router.push('/burgers')}
			>
				<Text
					style={{
						fontSize: 20,
						color: '#E8242F',
						textShadowColor: 'black',
						textShadowRadius: 1,
					}}
				>
					Burgers of the Day
				</Text>
			</Button>
			<Button
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
				onPress={() => router.push('/characters')}
			>
				<Text
					style={{
						fontSize: 20,
						color: '#E8242F',
						textShadowColor: 'black',
						textShadowRadius: 1,
					}}
				>
					Characters
				</Text>
			</Button>
			<Button
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
				onPress={() => router.push('/endCredits')}
			>
				<Text
					style={{
						fontSize: 20,
						color: '#E8242F',
						textShadowColor: 'black',
						textShadowRadius: 1,
					}}
				>
					End Credits
				</Text>
			</Button>
			<Button
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
				onPress={() => router.push('/episodes')}
			>
				<Text
					style={{
						fontSize: 20,
						color: '#E8242F',
						textShadowColor: 'black',
						textShadowRadius: 1,
					}}
				>
					Episodes
				</Text>
			</Button>
			<Button
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
				onPress={() => router.push('/pestControl')}
			>
				<Text
					style={{
						fontSize: 20,
						color: '#E8242F',
						textShadowColor: 'black',
						textShadowRadius: 1,
					}}
				>
					Pest Control Trucks
				</Text>
			</Button>
			<Button
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
				onPress={() => router.push('/stores')}
			>
				<Text
					style={{
						fontSize: 20,
						color: '#E8242F',
						textShadowColor: 'black',
						textShadowRadius: 1,
					}}
				>
					Stores Next Door
				</Text>
			</Button>
			<XStack
				alignItems='center'
				paddingHorizontal={10}
				backgroundColor={'#F8DF24'}
				borderWidth={4}
				borderColor={'#E8242F'}
				borderRadius={8}
			>
				<Ionicons name='search' size={20} color='#E8242F' />
				<Input
					fontSize={20}
					placeholder='Search'
					placeholderTextColor='#E8242F'
					color='#E8242F'
					backgroundColor='#F8DF24'
					borderColor='#F8DF24'
					borderWidth={0}
					paddingLeft={10}
					flex={1}
				/>
			</XStack>
		</View>
	);
}
