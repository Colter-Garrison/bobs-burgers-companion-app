import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContent } from './DrawerContent';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import {
	DARK_THEME_COLORS,
	LIGHT_THEME_COLORS,
} from '../jest/themeColorsFixture';

jest.mock('../hooks/useAuth');
jest.mock('../hooks/useTheme');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@react-navigation/drawer', () => {
	const { Pressable, Text, View } = jest.requireActual('react-native');
	return {
		DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
		DrawerItemList: () => <Text>DrawerItemList</Text>,
		DrawerItem: ({
			label,
			onPress,
		}: {
			label: string;
			onPress: () => void;
		}) => (
			<Pressable onPress={onPress} accessibilityRole='button'>
				<Text>{label}</Text>
			</Pressable>
		),
	};
});

const fakeDrawerProps = {} as unknown as DrawerContentComponentProps;

describe('DrawerContent', () => {
	const mockPush = jest.fn();
	const mockLogout = jest.fn();

	const mockToggleTheme = jest.fn();
	const mockSetColorblindMode = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: mockToggleTheme,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode: mockSetColorblindMode,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('shows only a Log In link at the top when logged out, but still shows Buy Me a Beer', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			username: null,
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByText('Log In')).toBeVisible();
		expect(screen.queryByText('Sign Up')).toBeNull();
		expect(screen.queryByText(/^Hello, /)).toBeNull();
		expect(screen.queryByText('Favorites')).toBeNull();
		expect(screen.queryByText('Log Out')).toBeNull();
		expect(screen.getByText('Buy me a beer 🍺')).toBeVisible();

		fireEvent.press(screen.getByText('Log In'));
		expect(mockPush).toHaveBeenCalledWith('/login');
	});

	it('shows "Hello, {username}!", Favorites, and Log Out when logged in', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			username: 'bobbelcher',
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.queryByText('Log In')).toBeNull();
		expect(screen.queryByText('Sign Up')).toBeNull();
		expect(screen.queryByText('Account')).toBeNull();

		fireEvent.press(screen.getByText('Hello, bobbelcher!'));
		expect(mockPush).toHaveBeenCalledWith('/account');

		fireEvent.press(screen.getByText('Favorites'));
		expect(mockPush).toHaveBeenCalledWith('/favorites');
	});

	it('Log Out logs out and navigates home', async () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			username: 'bobbelcher',
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		await fireEvent.press(screen.getByText('Log Out'));
		expect(mockLogout).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('Buy Me a Beer opens the donation page when logged in', () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			username: 'bobbelcher',
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		fireEvent.press(screen.getByText('Buy me a beer 🍺'));
		expect(openURLSpy).toHaveBeenCalledWith(
			'https://www.buymeacoffee.com/colterg',
		);

		openURLSpy.mockRestore();
	});

	it('Buy Me a Beer opens the donation page when logged out too — it is not an account action', () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never);
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			username: null,
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		fireEvent.press(screen.getByText('Buy me a beer 🍺'));
		expect(openURLSpy).toHaveBeenCalledWith(
			'https://www.buymeacoffee.com/colterg',
		);

		openURLSpy.mockRestore();
	});

	it('shows the sun icon (not the moon) in light mode, and calls toggleTheme when pressed', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			username: null,
			logout: mockLogout,
		});
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: mockToggleTheme,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode: mockSetColorblindMode,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByLabelText('Switch to dark mode')).toBeVisible();
		expect(screen.queryByLabelText('Switch to light mode')).toBeNull();

		fireEvent.press(screen.getByLabelText('Switch to dark mode'));
		expect(mockToggleTheme).toHaveBeenCalled();
	});

	it('shows the moon icon (not the sun) in dark mode', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			username: null,
			logout: mockLogout,
		});
		(useTheme as jest.Mock).mockReturnValue({
			isDark: true,
			toggleTheme: mockToggleTheme,
			colors: DARK_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode: mockSetColorblindMode,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByLabelText('Switch to light mode')).toBeVisible();
		expect(screen.queryByLabelText('Switch to dark mode')).toBeNull();
	});

	it('always renders the category link list', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			username: null,
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByText('DrawerItemList')).toBeVisible();
	});
});
