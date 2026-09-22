import React from 'react'
import { FavoriteButton } from 'bobs-burgers-components'

const noop = () => {}

// The hamburger icon: faded when not favorited...
export const NotFavorited = () => (
	<FavoriteButton favorited={false} onToggle={noop} itemName='Bob Belcher' />
)

// ...fully opaque once favorited. itemName feeds the screen-reader label.
export const Favorited = () => (
	<FavoriteButton favorited onToggle={noop} itemName='Bob Belcher' />
)
