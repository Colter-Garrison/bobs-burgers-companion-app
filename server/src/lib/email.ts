import { env } from '../env.js';
import { logger } from './logger.js';

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text: string;
}

export async function sendEmail({
	to,
	subject,
	html,
	text,
}: SendEmailOptions): Promise<void> {
	if (!env.RESEND_API_KEY) {
		logger.info(
			{ to, subject, html, text },
			'Email not sent (no RESEND_API_KEY) — logging instead',
		);
		return;
	}

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.EMAIL_FROM_ADDRESS,
			to,
			subject,
			html,
			text,
		}),
	});

	if (!response.ok) {
		const body = await response.text().catch(() => '');
		throw new Error(`Failed to send email via Resend: ${response.status} ${body}`);
	}
}

interface EmailShellOptions {
	heading: string;
	bodyHtml: string;
	ctaLabel?: string;
	ctaUrl?: string;
	footnote: string;
}

function emailShell({
	heading,
	bodyHtml,
	ctaLabel,
	ctaUrl,
	footnote,
}: EmailShellOptions): string {
	const button =
		ctaUrl && ctaLabel
			? `
				<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
					<tr>
						<td style="border-radius: 6px; background-color: #F2C94C;">
							<a href="${ctaUrl}" style="display: inline-block; padding: 12px 28px; font-size: 16px; font-weight: bold; color: #3A2A1E; text-decoration: none;">${ctaLabel}</a>
						</td>
					</tr>
				</table>
				<p style="margin: 0 0 24px; font-size: 13px; color: #8A7B65; word-break: break-all;">
					Or copy this link: <a href="${ctaUrl}" style="color: #D6483B;">${ctaUrl}</a>
				</p>
			`
			: '';

	return `
		<!doctype html>
		<html>
			<body style="margin: 0; padding: 24px 0; background-color: #FFF8E7; font-family: Georgia, 'Times New Roman', serif;">
				<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
					<tr>
						<td align="center">
							<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; border: 1px solid #E8DCC0;">
								<tr>
									<td style="background-color: #D6483B; padding: 20px 24px; border-radius: 8px 8px 0 0;">
										<span style="font-size: 20px; font-weight: bold; color: #FFF8E7;">🍔 Bob's Burgers Companion App</span>
									</td>
								</tr>
								<tr>
									<td style="padding: 28px 24px; color: #3A2A1E; font-size: 16px; line-height: 1.5;">
										<h1 style="margin: 0 0 12px; font-size: 20px; color: #D6483B;">${heading}</h1>
										${bodyHtml}
										${button}
										<p style="margin: 0; font-size: 13px; color: #8A7B65;">${footnote}</p>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</body>
		</html>
	`;
}

export function sendVerificationEmail(to: string, verifyUrl: string) {
	return sendEmail({
		to,
		subject: "Verify your email — Bob's Burgers Companion App",
		html: emailShell({
			heading: 'Verify your email',
			bodyHtml:
				'<p style="margin: 0 0 8px;">Click the button below to verify this email address for your account.</p>',
			ctaLabel: 'Verify Email',
			ctaUrl: verifyUrl,
			footnote: "If you didn't request this, you can ignore this email.",
		}),
		text: [
			'Verify your email',
			'',
			'Click the link below to verify this email address for your account:',
			verifyUrl,
			'',
			"If you didn't request this, you can ignore this email.",
		].join('\n'),
	});
}

export function sendPasswordResetEmail(to: string, resetUrl: string) {
	return sendEmail({
		to,
		subject: "Reset your password — Bob's Burgers Companion App",
		html: emailShell({
			heading: 'Reset your password',
			bodyHtml:
				'<p style="margin: 0 0 8px;">Click the button below to set a new password. This link expires in 1 hour.</p>',
			ctaLabel: 'Reset Password',
			ctaUrl: resetUrl,
			footnote:
				"If you didn't request this, you can ignore this email — your password won't change.",
		}),
		text: [
			'Reset your password',
			'',
			'Click the link below to set a new password. This link expires in 1 hour:',
			resetUrl,
			'',
			"If you didn't request this, you can ignore this email — your password won't change.",
		].join('\n'),
	});
}

export function sendUsernameRecoveryEmail(to: string, username: string) {
	return sendEmail({
		to,
		subject: "Your username — Bob's Burgers Companion App",
		html: emailShell({
			heading: 'Your username',
			bodyHtml: `<p style="margin: 0 0 8px;">Your username is: <strong style="color: #D6483B;">${username}</strong></p>`,
			footnote: "If you didn't request this, you can ignore this email.",
		}),
		text: [
			'Your username',
			'',
			`Your username is: ${username}`,
			'',
			"If you didn't request this, you can ignore this email.",
		].join('\n'),
	});
}
