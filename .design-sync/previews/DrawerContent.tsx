import React from 'react'
import { DrawerContent } from 'bobs-burgers-components'

// DrawerContent renders inside Expo Router's drawer, which hands it the
// navigator's state. Outside the app, pass the same shape: the screens in
// order, each with its options (these match app/_layout.tsx).
const itemOptions = {
	drawerItemStyle: {
		borderWidth: 4,
		borderColor: '#2C4A63',
		backgroundColor: '#C9D9E4',
		borderRadius: 8,
	},
	drawerLabelStyle: { fontFamily: 'Chewy', fontSize: 16 },
	drawerActiveTintColor: '#2C4A63',
	drawerInactiveTintColor: '#2C4A63',
}
const screens: [string, string, string?][] = [
	['index', 'Home'],
	['(categories)/burgers', 'Burgers of the Day'],
	['(categories)/characters', 'Characters'],
	['(categories)/endcredits', 'End Credits'],
	['(categories)/episodes', 'Episodes'],
	['(categories)/pestcontrol', 'Pest Control Trucks'],
	['(categories)/stores', 'Stores Next Door'],
	['favorites', 'My Favorites', 'Favorites'],
	['aboutthedev', 'About the Dev'],
]

function drawerProps(currentIndex: number) {
	return {
		state: {
			index: currentIndex,
			routes: screens.map(([name]) => ({ key: name, name })),
		},
		descriptors: Object.fromEntries(
			screens.map(([name, title, drawerLabel]) => [
				name,
				{ options: { title, drawerLabel, ...itemOptions } },
			]),
		),
		navigation: { dispatch: () => {} },
	} as never
}

// Theme/colorblind toggles on top, then every screen as a link. The current
// screen gets aria-current="page"; the app styles current and other items the
// same (drawerActiveTintColor === drawerInactiveTintColor), so it isn't visual.
export const Default = () => (
	<div style={{ width: 300, height: 640, background: '#8FCBEA' }}>
		<DrawerContent {...drawerProps(2)} />
	</div>
)
