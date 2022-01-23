import type { RequestEvent } from '@sveltejs/kit';
import { changePassword } from '$lib/ldap';

import type { ChangePasswordParam } from '$lib/models/auth';
import { chain } from '$lib/chain';
import { forbid } from '$lib/forbid';
import type { Locals } from '$lib/models/locals';

const BAD_REQUEST = { status: 400, body: { message: 'Bad Request' } };
const UNAUTHORIZED = { status: 401, body: { message: 'Invalid user name or password' } };
const UNAVAILABLE = { status: 503, body: { message: 'Service currently unavailable' } };

/**
 * Create a new online session
 * @param request Request to process
 */
export const post = chain(forbid, async (event: RequestEvent<Locals>) => {
	try {
		const { password, newPassword }: ChangePasswordParam = await event.request.json();
		if (!(password && newPassword)) {
			return BAD_REQUEST;
		}

    if (!await changePassword(event.locals.user, password, newPassword)) {
      return UNAUTHORIZED;
    }
		return { status: 204 };
	} catch {
		return UNAVAILABLE;
	}
});
