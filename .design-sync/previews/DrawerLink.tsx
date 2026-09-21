import React from 'react'
import { DrawerLink } from 'bobs-burgers-components'

// The boxed item style the app's drawer applies (app/_layout.tsx).
const item = {
	borderWidth: 4,
	borderColor: '#2C4A63',
	backgroundColor: '#C9D9E4',
	borderRadius: 8,
}
const label = { fontFamily: 'Chewy', fontSize: 16 }

// A drawer entry, rendered as a real link (<a href> on web). focused marks
// the current screen with aria-current="page" - not a visual change in the
// app's drawer styling, which uses the same colors for both.
export const Default = () => (
	<DrawerLink
		href='/characters'
		label='Characters'
		focused
		color='#2C4A63'
		style={item}
		labelStyle={label}
	/>
)
