import type { Request, Response, NextFunction } from 'express';

// Express recognizes this as an error-handling middleware specifically
// because it takes 4 parameters (err first) — that's not just a style
// choice, Express checks the function's arity. It must be registered
// after every route with app.use(), so anything a route passes to
// next(err) ends up here instead of Express's default plain-text/HTML
// error page.
export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	console.error(err);
	// Never send err.message or a stack trace to the client — it can leak
	// internal details (file paths, query structure, library versions).
	// The server-side console.error above is where you'd actually look to
	// debug this.
	res.status(500).json({ error: 'Internal server error' });
}
