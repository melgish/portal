import type { Locals } from '$lib/models/locals';
import { Redis } from '$lib/redis';
import type { RequestEvent } from '@sveltejs/kit';
import { serialize } from 'cookie';

/**
 * Delete an existing online session.
 * @param request Request to process
 */
export const del = async ({ locals: { sessionId } }: RequestEvent<Locals>) => {
	if (sessionId) {
		await Redis.del(sessionId).catch(() => void 0);
	}
	// Clear the session cookie
	const headers = new Headers();
	headers.append('Set-Cookie', serialize(Redis.name, '', { path: '/', expires: new Date(0) }));

	return { status: 204, headers };
};
