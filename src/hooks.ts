import type { Session } from '$lib/models/session';
import { config } from 'dotenv';
import { parse } from 'cookie';
import { Redis } from '$lib/redis';
import type { RequestEvent } from '@sveltejs/kit';
import type { Locals } from '$lib/models/locals';
import type { User } from '$lib/models/user';

// Since hooks are server side, and used by all the api stuff
// load runtime environment from .env file here.
config();

export interface HandleParam {
	event: RequestEvent<Locals>,
	resolve: (request: RequestEvent) => unknown
}

export const handle = async ({ event, resolve }: HandleParam) => {
	// Grab the cookie, and fetch the session.
	const headers = event.request.headers;
	const cookies = parse(headers.get('Cookie') ?? '');
	const sessionId = cookies[Redis.name];
	if (sessionId) {
		// only thing in the session is the user's info
		const user = await Redis.get(sessionId) as User;
		if (user) {
			event.locals.sessionId = sessionId;
			event.locals.authenticated = true;
			event.locals.user = user;
		}
	}
	return await resolve(event);
};

export async function getSession(request): Promise<Session> {
	const { authenticated, user } = request.locals ?? {};
	return { authenticated, user };
}
