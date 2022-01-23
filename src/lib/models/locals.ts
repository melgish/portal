import type { User } from '$lib/models/user';

export interface Locals {
	/**
	 * True when user has been authenticated
	 */
	authenticated?: boolean;
	/**
	 * Session ID
	 */
	sessionId?: string;
	/**
	 * User info when authenticated
	 */
	user?: User;
}
