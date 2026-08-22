import { describe, it, expect } from 'vitest';
import { api } from './helpers.js';

describe('request logging middleware', () => {
	it('attaches a generated X-Request-Id header to every response', async () => {
		const res = await api.get('/health');

		expect(res.status).toBe(200);
		expect(typeof res.headers['x-request-id']).toBe('string');
		expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
	});

	it('echoes back a caller-supplied X-Request-Id instead of generating a new one', async () => {
		const res = await api.get('/health').set('X-Request-Id', 'test-fixed-id');

		expect(res.headers['x-request-id']).toBe('test-fixed-id');
	});

	it('gives two separate requests different generated ids', async () => {
		const [first, second] = await Promise.all([
			api.get('/health'),
			api.get('/health'),
		]);

		expect(first.headers['x-request-id']).not.toBe(second.headers['x-request-id']);
	});
});
