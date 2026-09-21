import React, { useEffect, useSyncExternalStore } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { Href, useRootNavigationState, useRouter } from 'expo-router'

const LOWERCASE_ROUTE_REDIRECTS: Record<string, string> = {
	'/endcredits': '/endCredits',
	'/pestcontrol': '/pestControl',
	'/aboutthedev': '/aboutTheDev',
}

const subscribeNever = () => () => {}

// false while statically rendering (no window to read the URL from) and
// during hydration, true in the browser after that — without a mount
// effect that sets state.
function useIsClient() {
	return useSyncExternalStore(
		subscribeNever,
		() => true,
		() => false,
	)
}

export default function NotFound() {
	const router = useRouter()
	const rootNavigationState = useRootNavigationState()
	const isClient = useIsClient()
	const isNavigationReady = Boolean(rootNavigationState?.key)

	const correctedPath =
		isClient && Platform.OS === 'web'
			? LOWERCASE_ROUTE_REDIRECTS[window.location.pathname.toLowerCase()]
			: undefined

	useEffect(() => {
		if (isNavigationReady && correctedPath) {
			router.push(`${correctedPath}${window.location.search}` as Href)
		}
	}, [isNavigationReady, correctedPath, router])

	// Render nothing until it's known whether this is really a missing
	// page or just a lowercased URL about to be redirected, so the "not
	// found" message never flashes before a redirect.
	if (!isClient || !isNavigationReady || correctedPath) {
		return null
	}

	return (
		<View className='flex-1 items-center justify-center gap-[10px] bg-lightBg dark:bg-darkBg p-[10px]'>
			<Text
				accessibilityRole='header'
				className='font-chewy text-[32px] text-lightAccent dark:text-darkAccent'
			>
				Page Not Found
			</Text>
			<Text className='font-chewy text-center text-lightAccent dark:text-darkAccent'>
				This page doesn&apos;t exist.
			</Text>
			<Pressable
				onPress={() => router.push('/')}
				hitSlop={12}
				accessibilityRole='button'
			>
				<Text className='font-chewy text-lightAccent dark:text-darkAccent underline'>
					Go to Home
				</Text>
			</Pressable>
		</View>
	)
}
