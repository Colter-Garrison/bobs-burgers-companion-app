import { config } from '@tamagui/config/v3';
import { createTamagui } from 'tamagui';

const tamaguiConfig = createTamagui({
	...config,
	fonts: {
		...config.fonts,
		heading: {
			family: 'BobsBurgers',
			size: {
				1: 12,
				2: 14,
				3: 16,
				4: 18,
				5: 20,
				6: 22,
				7: 24,
				8: 26,
				9: 28,
				10: 30,
			},
			weight: {
				1: '400',
			},
			lineHeight: {
				1: 18,
				2: 20,
				3: 22,
			},
			letterSpacing: {
				1: 0,
				2: 0.5,
			},
		},
		body: {
			family: 'BobsBurgers2',
			size: {
				1: 12,
				2: 14,
				3: 16,
				4: 18,
				5: 20,
				6: 22,
				7: 24,
				8: 26,
				9: 28,
				10: 30,
			},
			weight: {
				1: '400',
			},
			lineHeight: {
				1: 18,
				2: 20,
				3: 22,
			},
			letterSpacing: {
				1: 0,
				2: 0.5,
			},
		},
	},
});

type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
	interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
