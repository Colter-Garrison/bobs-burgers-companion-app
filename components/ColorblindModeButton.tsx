import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import {
	COLORBLIND_MODES,
	COLORBLIND_MODE_LABELS,
} from '../lib/colorblindPalettes';

export function ColorblindModeButton() {
	const { isDark, colors, colorblindMode, setColorblindMode } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<View>(null);
	const isActive = colorblindMode !== 'none';

	useEffect(() => {
		if (Platform.OS !== 'web' || !isOpen) {
			return;
		}
		const node = panelRef.current as unknown as HTMLElement | null;
		if (node) {
			node.setAttribute('tabindex', '-1');
			node.focus();
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	return (
		<>
			<Pressable
				onPress={() => setIsOpen(true)}
				hitSlop={11}
				accessibilityRole='button'
				accessibilityLabel={
					isActive
						? `Colorblind mode: ${COLORBLIND_MODE_LABELS[colorblindMode]}. Opens menu to change it.`
						: 'Colorblind mode: off. Opens menu to turn it on.'
				}
			>
				<MaterialCommunityIcons
					name={isActive ? 'eye' : 'eye-outline'}
					size={22}
					color={isDark ? '#F0F0F0' : colors.accent}
				/>
			</Pressable>

			<Modal
				visible={isOpen}
				transparent
				animationType='fade'
				onRequestClose={() => setIsOpen(false)}
			>
				<Pressable
					className='flex-1 items-center justify-center p-[10px]'
					style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
					onPress={() => setIsOpen(false)}
					accessibilityLabel='Close colorblind mode menu'
					accessibilityRole='button'
				>
					<Pressable
						ref={panelRef}
						onPress={() => {}}
						accessibilityRole='none'
						className='w-64 gap-1 rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-2'
					>
						<Text
							accessibilityRole='header'
							className='px-2 py-1 font-chewy text-[16px] text-lightAccent dark:text-darkAccent'
						>
							Colorblind Mode
						</Text>
						{COLORBLIND_MODES.map((mode) => {
							const isSelected = mode === colorblindMode;
							return (
								<Pressable
									key={mode}
									onPress={() => {
										setColorblindMode(mode);
										setIsOpen(false);
									}}
									hitSlop={4}
									accessibilityRole='button'
									accessibilityState={{ selected: isSelected }}
									accessibilityLabel={
										mode === 'none'
											? 'Turn off colorblind mode'
											: `Colorblind mode: ${COLORBLIND_MODE_LABELS[mode]}`
									}
									className={
										isSelected
											? 'rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightAccent px-3 py-2 dark:bg-darkAccent'
											: 'rounded-lg border-4 border-transparent px-3 py-2'
									}
								>
									<Text
										className={
											isSelected
												? 'font-chewy text-[15px] text-lightSurface dark:text-darkOnAccent'
												: 'font-chewy text-[15px] text-lightAccent dark:text-darkAccent'
										}
									>
										{COLORBLIND_MODE_LABELS[mode]}
									</Text>
								</Pressable>
							);
						})}
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
}
