import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import {
	DrawerContentComponentProps,
	DrawerContentScrollView,
	DrawerItemList,
} from '@react-navigation/drawer';
import { useAuth } from '../hooks/useAuth';

export function DrawerContent(props: DrawerContentComponentProps) {
	const router = useRouter();
	const { token, email, logout } = useAuth();

	return (
		<DrawerContentScrollView {...props} className='bg-[#5D74A6]'>
			<DrawerItemList {...props} />

			<View className='mt-4 gap-2 border-t-2 border-[#E4E4E5] p-4'>
				{token ? (
					<>
						<Text className='font-chewy text-[#E4E4E5]'>
							Logged in as {email}
						</Text>
						<Pressable onPress={logout}>
							<Text className='font-chewy text-bbRed'>Log Out</Text>
						</Pressable>
					</>
				) : (
					<>
						<Pressable onPress={() => router.push('/login')}>
							<Text className='font-chewy text-[#E4E4E5]'>Log In</Text>
						</Pressable>
						<Pressable onPress={() => router.push('/signup')}>
							<Text className='font-chewy text-[#E4E4E5]'>Sign Up</Text>
						</Pressable>
					</>
				)}
			</View>
		</DrawerContentScrollView>
	);
}
