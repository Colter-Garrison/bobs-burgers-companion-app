import { config } from '@tamagui/config/v3';
import { createTamagui } from 'tamagui';

const tamaguiConfig = createTamagui({
	...config,
	fonts: {
		...config.fonts,
		heading: {
			family: 'BobsBurgers',
			size: {
				...config.fonts.heading.size,
			},
			weight: {
				...config.fonts.heading.weight,
			},
			lineHeight: {
				...config.fonts.heading.lineHeight,
			},
			letterSpacing: {
				...config.fonts.heading.letterSpacing,
			},
		},
		body: {
			family: 'BobsBurgers',
			size: {
				...config.fonts.body.size,
			},
			weight: {
				...config.fonts.body.weight,
			},
			lineHeight: {
				...config.fonts.body.lineHeight,
			},
			letterSpacing: {
				...config.fonts.body.letterSpacing,
			},
		},
	},
});

type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
	interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig;
