import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { env } from '../env.js';
import { sendVerificationEmail } from './email.js';
import { createToken } from './tokens.js';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function issueEmailVerification(
	userId: number,
	email: string,
	options?: { skipCooldown?: boolean },
): Promise<void> {
	await db
		.update(users)
		.set({ email, emailVerifiedAt: null })
		.where(eq(users.id, userId));

	const token = await createToken(
		userId,
		'email_verification',
		VERIFICATION_TTL_MS,
		options,
	);
	if (!token) {
		return;
	}

	const verifyUrl = `${env.WEB_APP_URL}/verifyEmail?token=${token}`;
	await sendVerificationEmail(email, verifyUrl);
}
