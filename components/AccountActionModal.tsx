import React, { useEffect, useRef } from 'react'
import { Modal, Platform, Pressable, Text, View } from 'react-native'

interface AccountActionModalProps {
	visible: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
}

export function AccountActionModal({
	visible,
	onClose,
	title,
	children,
}: AccountActionModalProps) {
	const panelRef = useRef<View>(null)

	const onCloseRef = useRef(onClose)
	onCloseRef.current = onClose

	useEffect(() => {
		if (Platform.OS !== 'web' || !visible) {
			return
		}
		const node = panelRef.current as unknown as HTMLElement | null
		if (node) {
			node.setAttribute('tabindex', '-1')
			node.focus()
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onCloseRef.current()
			}
		}
		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [visible])

	return (
		<Modal
			visible={visible}
			transparent
			animationType='fade'
			onRequestClose={onClose}
		>
			<Pressable
				className='flex-1 items-center justify-center p-[10px]'
				style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
				onPress={onClose}
				accessibilityLabel={`Close ${title} dialog`}
				accessibilityRole='button'
			>
				<Pressable
					ref={panelRef}
					onPress={() => {}}
					accessibilityRole='none'
					className='w-full max-w-[340px] gap-[10px] rounded-lg border-4 border-lightAccent dark:border-darkAccent bg-lightSurface dark:bg-darkSurface p-[16px]'
				>
					<Text
						accessibilityRole='header'
						className='font-chewy text-[20px] text-lightAccent dark:text-darkAccent'
					>
						{title}
					</Text>
					{children}
				</Pressable>
			</Pressable>
		</Modal>
	)
}
