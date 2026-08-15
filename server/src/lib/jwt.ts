import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface JwtPayload {
	userId: number;
}

export function signToken(payload: JwtPayload): string {
	// expiresIn: '7d' — a personal app has no refresh-token flow (yet), so
	// this token is the only thing standing between "logged in" and
	// "logged out". A short expiry (say, 1 hour) would just mean
	// re-entering your password constantly for no real security benefit
	// at this scale; a week is a common middle ground.
	return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
	// jwt.verify both checks the signature (proving JWT_SECRET signed it —
	// i.e. it wasn't forged) and the expiry, throwing if either check
	// fails. There's no separate "is this expired" check needed.
	return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
