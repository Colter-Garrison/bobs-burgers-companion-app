// Stand-ins for the Expo Router APIs the components call, so they render
// outside the app's navigator (Claude Design has no router). Only the
// library build aliases expo-router to this file; the app never uses it.
import React, { cloneElement, isValidElement } from 'react'
import { ScrollView, ScrollViewProps, Text } from 'react-native'

type HrefLike = string | { pathname?: string }

const toPath = (href: HrefLike | undefined) =>
	typeof href === 'string' ? href : (href?.pathname ?? '#')

const noop = () => {}

export function useRouter() {
	return {
		push: noop,
		replace: noop,
		navigate: noop,
		back: noop,
		canGoBack: () => false,
	}
}

export function usePathname() {
	return '/'
}

export function useLocalSearchParams() {
	return {}
}

export function useFocusEffect() {}

export function Link({
	href,
	asChild,
	children,
	...rest
}: {
	href: HrefLike
	asChild?: boolean
	children?: React.ReactNode
	[key: string]: unknown
}) {
	const path = toPath(href)
	if (asChild && isValidElement(children)) {
		return cloneElement(children as React.ReactElement<object>, {
			href: path,
			...rest,
		})
	}
	return (
		<Text role='link' href={path} {...rest}>
			{children}
		</Text>
	)
}

// Drawer.Screen only sets header options inside a navigator: nothing to show.
export const Drawer = Object.assign(() => null, { Screen: () => null })

export function DrawerContentScrollView(props: ScrollViewProps) {
	return <ScrollView {...props} />
}

export const DrawerActions = {
	openDrawer: () => ({ type: 'OPEN_DRAWER' }),
	closeDrawer: () => ({ type: 'CLOSE_DRAWER' }),
	toggleDrawer: () => ({ type: 'TOGGLE_DRAWER' }),
}

export function useLinkBuilder() {
	return {
		buildHref: (name: string) =>
			'/' + name.replace(/^\(.*?\)\//, '').replace(/^index$/, ''),
	}
}
