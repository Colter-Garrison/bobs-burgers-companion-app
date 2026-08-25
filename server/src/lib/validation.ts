import { z } from 'zod';

export const usernameSchema = z
	.string()
	.min(2, 'Username must be 2-25 characters')
	.max(25, 'Username must be 2-25 characters')
	.regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers');
