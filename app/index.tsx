import React from 'react';
import {
	Button,
	H1,
	H2,
	H3,
	H4,
	H5,
	H6,
	Paragraph,
	SizableText,
	View,
	XStack,
	YStack,
} from 'tamagui';

export default function Index() {
	return (
		<View>
			<YStack>
				<H1>Heading 1</H1>
				<H2>Heading 2</H2>
				<H3>Heading 3</H3>
				<H4>Heading 4</H4>
				<H5>Heading 5</H5>
				<H6>Heading 6</H6>
				<Paragraph>Paragraph</Paragraph>
				<SizableText size='$9'>SizableText</SizableText>
				<Button alignSelf='center' size='$6'>
					Large
				</Button>
			</YStack>
			<YStack gap='$2' alignItems='center'>
				<SizableText size='$3'>SizableText</SizableText>
				<XStack gap='$2'>
					<SizableText theme='alt1' size='$3'>
						alt1
					</SizableText>
					<SizableText theme='alt2' size='$3'>
						alt2
					</SizableText>
				</XStack>
				<Paragraph size='$3' fontWeight='800'>
					Paragraph
				</Paragraph>
			</YStack>
		</View>
	);
}
