import { describe, it, expect } from 'vitest';
import { api } from './helpers.js';

describe('CORS', () => {
	it('echoes back an allowed origin on a simple request', async () => {
		const res = await api.get('/health').set('Origin', 'http://localhost:8081');

		expect(res.status).toBe(200);
		expect(res.headers['access-control-allow-origin']).toBe(
			'http://localhost:8081',
		);
	});

	it('does not echo back a disallowed origin', async () => {
		const res = await api
			.get('/health')
			.set('Origin', 'http://evil.example.com');

		expect(res.headers['access-control-allow-origin']).toBeUndefined();
	});

	it('handles a preflight OPTIONS request for an allowed origin', async () => {
		const res = await api
			.options('/favorites')
			.set('Origin', 'http://localhost:8081')
			.set('Access-Control-Request-Method', 'GET');

		expect(res.status).toBe(204);
		expect(res.headers['access-control-allow-origin']).toBe(
			'http://localhost:8081',
		);
	});
});
