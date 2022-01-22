import type { User } from "$lib/models/user";

export interface Session {
  /**
   * True when user has been authenticated.
   */
  authenticated?: boolean;
  /**
   * User info when authenticated.
   */
  user?: User;
}
