import React from 'react'
import { Linking } from 'react-native'
import { render, screen, fireEvent } from '@testing-library/react-native'
import AboutTheDev from './aboutTheDev'
import {
	DEV_CHARACTER_LONG_BIO,
	DEV_GITHUB_URL,
	DEV_LINKEDIN_URL,
} from '../lib/devCharacter'

jest.mock('expo-router/drawer', () => ({
	Drawer: { Screen: () => null },
}))

describe('AboutTheDev', () => {
	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('shows the name and the longer bio', () => {
		render(<AboutTheDev />)

		expect(screen.getByText('Colter Garrison')).toBeVisible()
		expect(screen.getByText(DEV_CHARACTER_LONG_BIO)).toBeVisible()
	})

	it('LinkedIn link opens the LinkedIn profile', () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never)

		render(<AboutTheDev />)
		fireEvent.press(screen.getByText('LinkedIn'))

		expect(openURLSpy).toHaveBeenCalledWith(DEV_LINKEDIN_URL)
	})

	it('GitHub link opens the repository', () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never)

		render(<AboutTheDev />)
		fireEvent.press(screen.getByText('GitHub'))

		expect(openURLSpy).toHaveBeenCalledWith(DEV_GITHUB_URL)
	})

	it('shows Buy me a Coffee below the card and opens the donation page when pressed', () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never)

		render(<AboutTheDev />)
		fireEvent.press(screen.getByText('Buy me a Coffee ☕'))

		expect(openURLSpy).toHaveBeenCalledWith(
			'https://www.buymeacoffee.com/colterg',
		)
	})
})
