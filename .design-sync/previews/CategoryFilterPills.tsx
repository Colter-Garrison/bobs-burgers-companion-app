import React from 'react'
import { CategoryFilterPills } from 'bobs-burgers-components'

const noop = () => {}

// "All" plus the six categories; the selected pill is filled.
export const AllSelected = () => (
	<CategoryFilterPills selected='All' onSelect={noop} />
)

export const CharactersSelected = () => (
	<CategoryFilterPills selected='Characters' onSelect={noop} />
)
