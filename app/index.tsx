import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Linking, Pressable } from 'react-native';
import {
	Button,
	Input,
	ScrollView,
	SizableText,
	Text,
	XStack,
	YStack,
} from 'tamagui';
import { SearchItem, useSearchableItems } from '../hooks/useSearchableItems';

export default function Index() {
	const router = useRouter();
	const { items, loading } = useSearchableItems();
	const [query, setQuery] = useState('');

	const filteredItems = useMemo(() => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return [];
		return items.filter((item) => item.label.toLowerCase().includes(trimmed));
	}, [items, query]);

	const handleResultPress = (item: SearchItem) => {
		if (item.linkUrl) {
			Linking.openURL(item.linkUrl);
		}
	};

	const isSearching = query.trim().length > 0;

	return (
		<ScrollView flex={1} backgroundColor={'#BDFB73'}>
			<YStack gap={10} padding={10}>
				<Input
					placeholder='Search burgers, characters, episodes...'
					placeholderTextColor='#E8242F'
					value={query}
					onChangeText={setQuery}
					backgroundColor={'#F8DF24'}
					borderWidth={4}
					borderColor={'#E8242F'}
					borderRadius={8}
					color={'#E8242F'}
					fontSize={18}
				/>

				{isSearching &&
					(loading ? (
						<SizableText color='#E8242F'>Loading...</SizableText>
					) : filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<Pressable key={item.id} onPress={() => handleResultPress(item)}>
								<XStack
									gap={10}
									backgroundColor={'#F8DF24'}
									borderWidth={4}
									borderColor={'#E8242F'}
									borderRadius={8}
									padding={10}
									alignItems='center'
								>
									{item.image ? (
										<Image
											source={{ width: 60, height: 60, uri: item.image }}
											width={60}
											height={60}
											resizeMode='contain'
										/>
									) : null}
									<YStack flex={1}>
										<SizableText color='#E8242F' fontSize={12}>
											{item.category}
										</SizableText>
										<SizableText color='#E8242F' fontSize={16}>
											{item.label}
										</SizableText>
									</YStack>
								</XStack>
							</Pressable>
						))
					) : (
						<SizableText color='#E8242F'>No results found.</SizableText>
					))}

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
			</YStack>
		</ScrollView>
	);
}
