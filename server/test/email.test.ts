import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	sendPasswordResetEmail,
	sendUsernameRecoveryEmail,
	sendVerificationEmail,
} from '../src/lib/email.js';
import { env } from '../src/env.js';

describe('email templates', () => {
	const originalApiKey = env.RESEND_API_KEY;
	let fetchSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		env.RESEND_API_KEY = 'test-key';
		fetchSpy = vi
			.spyOn(global, 'fetch')
			.mockResolvedValue(new Response(null, { status: 200 }));
	});

	afterEach(() => {
		env.RESEND_API_KEY = originalApiKey;
		fetchSpy.mockRestore();
	});

	function sentBody(): { html: string; text: string } {
		const lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
		return JSON.parse(lastCall[1]!.body as string);
	}

	function sentHtml(): string {
		return sentBody().html;
	}

	it('sendVerificationEmail includes the verify link as a button and as a copyable link', async () => {
		await sendVerificationEmail('bob@example.com', 'https://example.com/verifyEmail?token=abc');

		const html = sentHtml();
		expect(html).toContain('https://example.com/verifyEmail?token=abc');
		expect(html).toContain('Verify Email');
		expect(html).toContain('Verify your email');
	});

	it('sendPasswordResetEmail includes the reset link and mentions the 1 hour expiry', async () => {
		await sendPasswordResetEmail('bob@example.com', 'https://example.com/resetPassword?token=xyz');

		const html = sentHtml();
		expect(html).toContain('https://example.com/resetPassword?token=xyz');
		expect(html).toContain('Reset Password');
		expect(html).toContain('expires in 1 hour');
	});

	it('sendUsernameRecoveryEmail includes the username with no CTA button', async () => {
		await sendUsernameRecoveryEmail('bob@example.com', 'bobbelcher123');

		const html = sentHtml();
		expect(html).toContain('bobbelcher123');
		expect(html).not.toContain('<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">');
	});

	it('every email shares the same Bob\'s Burgers-styled shell', async () => {
		await sendVerificationEmail('bob@example.com', 'https://example.com/verifyEmail?token=abc');

		const html = sentHtml();
		expect(html).toContain("Bob's Burgers Companion App");
		expect(html).toContain('#D6483B');
	});

	it('every email includes a plain-text part alongside the HTML, with the same links/content', async () => {
		await sendVerificationEmail('bob@example.com', 'https://example.com/verifyEmail?token=abc');
		let body = sentBody();
		expect(body.text).toContain('https://example.com/verifyEmail?token=abc');
		expect(body.text.toLowerCase()).not.toContain('<html');

		await sendPasswordResetEmail('bob@example.com', 'https://example.com/resetPassword?token=xyz');
		body = sentBody();
		expect(body.text).toContain('https://example.com/resetPassword?token=xyz');
		expect(body.text).toContain('expires in 1 hour');

		await sendUsernameRecoveryEmail('bob@example.com', 'bobbelcher123');
		body = sentBody();
		expect(body.text).toContain('bobbelcher123');
	});
});
