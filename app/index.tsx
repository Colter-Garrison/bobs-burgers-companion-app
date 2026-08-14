import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
	Image,
	Linking,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
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
		<ScrollView className='flex-1 bg-bbGreen'>
			<View className='flex-col gap-[10px] p-[10px]'>
				<TextInput
					placeholder='Search burgers, characters, episodes...'
					placeholderTextColor='#E8242F'
					value={query}
					onChangeText={setQuery}
					className='font-chewy rounded-lg border-4 border-bbRed bg-bbYellow p-2 text-[18px] text-bbRed'
				/>

				{isSearching &&
					(loading ? (
						<Text className='font-chewy text-bbRed'>Loading...</Text>
					) : filteredItems.length > 0 ? (
						filteredItems.map((item) => (
							<Pressable key={item.id} onPress={() => handleResultPress(item)}>
								<View className='flex-row items-center gap-[10px] rounded-lg border-4 border-bbRed bg-bbYellow p-[10px]'>
									{item.image ? (
										<Image
											source={{ width: 60, height: 60, uri: item.image }}
											width={60}
											height={60}
											resizeMode='contain'
										/>
									) : null}
									<View className='flex-1 flex-col'>
										<Text className='font-chewy text-[12px] text-bbRed'>
											{item.category}
										</Text>
										<Text className='font-chewy text-[16px] text-bbRed'>
											{item.label}
										</Text>
									</View>
								</View>
							</Pressable>
						))
					) : (
						<Text className='font-chewy text-bbRed'>No results found.</Text>
					))}

				<Pressable
					className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
					onPress={() => router.push('/burgers')}
				>
					<Text
						className='font-chewy text-[20px] text-bbRed'
						style={{ textShadowColor: 'black', textShadowRadius: 1 }}
					>
						Burgers of the Day
					</Text>
				</Pressable>
				<Pressable
					className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
					onPress={() => router.push('/characters')}
				>
					<Text
						className='font-chewy text-[20px] text-bbRed'
						style={{ textShadowColor: 'black', textShadowRadius: 1 }}
					>
						Characters
					</Text>
				</Pressable>
				<Pressable
					className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
					onPress={() => router.push('/endCredits')}
				>
					<Text
						className='font-chewy text-[20px] text-bbRed'
						style={{ textShadowColor: 'black', textShadowRadius: 1 }}
					>
						End Credits
					</Text>
				</Pressable>
				<Pressable
					className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
					onPress={() => router.push('/episodes')}
				>
					<Text
						className='font-chewy text-[20px] text-bbRed'
						style={{ textShadowColor: 'black', textShadowRadius: 1 }}
					>
						Episodes
					</Text>
				</Pressable>
				<Pressable
					className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
					onPress={() => router.push('/pestControl')}
				>
					<Text
						className='font-chewy text-[20px] text-bbRed'
						style={{ textShadowColor: 'black', textShadowRadius: 1 }}
					>
						Pest Control Trucks
					</Text>
				</Pressable>
				<Pressable
					className='items-center justify-center rounded-lg border-4 border-bbRed bg-bbYellow p-2'
					onPress={() => router.push('/stores')}
				>
					<Text
						className='font-chewy text-[20px] text-bbRed'
						style={{ textShadowColor: 'black', textShadowRadius: 1 }}
					>
						Stores Next Door
					</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}
