import { serialize } from 'cookie';
import type { RequestEvent } from '@sveltejs/kit';
import { signIn } from '$lib/ldap';
import { Redis } from '$lib/redis';
import type { SignInParam } from '$lib/models/auth';

const BAD_REQUEST = { status: 400, body: { message: 'Bad Request' } };
const UNAUTHORIZED = { status: 401, body: { message: 'Invalid user name or password' } };
const UNAVAILABLE = { status: 503, body: { message: 'Service currently unavailable' } };

/**
 * Create a new online session
 * @param request Request to process
 */
export const post = async ({ request }: RequestEvent) => {
	try {
		const { userName, password }: SignInParam = await request.json();
		if (!(userName && password)) {
			return BAD_REQUEST;
		}
		const user = await signIn(userName, password);
		if (!user) {
			return UNAUTHORIZED;
		}

		// Create session cookie
		const sessionId = await Redis.create(user);
		const headers = new Headers();
		headers.append(
			'Set-Cookie',
			serialize(Redis.name, sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV == 'production',
				maxAge: Redis.maxAge
			})
		);

		return { status: 200, body: user, headers };
	} catch {
		return UNAVAILABLE;
	}
};
