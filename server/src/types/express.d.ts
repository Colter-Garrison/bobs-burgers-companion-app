// TypeScript doesn't know about `userId` on Express's Request type by
// default — this "augments" the existing type so `req.userId` type-checks
// everywhere, instead of us having to use `any` or a cast at every route
// that reads it.
declare global {
	namespace Express {
		interface Request {
			userId?: number;
		}
	}
}

export {};
