import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface JwtPayload {
	userId: number;
}

export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
	return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
