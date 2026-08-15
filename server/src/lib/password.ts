import bcrypt from 'bcrypt';

// The "salt rounds" is how much work bcrypt does per hash — higher is
// slower to compute (both for us and for an attacker brute-forcing
// guesses) but also slower for real logins. 10 is bcrypt's long-standing
// practical default: enough work factor to resist brute force on
// commodity hardware, without adding noticeable delay to a real login.
const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
	// bcrypt generates its own random salt internally and bakes it into
	// the returned hash string, so we never store or manage salts
	// ourselves — hashPassword's output is the only thing that goes in
	// the database.
	return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
	plain: string,
	hash: string,
): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}
