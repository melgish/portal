/**
 * Parameter for signIn api
 */
export interface SignInParam {
	/**
	 * Name of user to sign in
	 */
	userName: string;
	/**
	 * Password to validate
	 */
	password: string;
}

/**
 * Parameters for changePassword api
 */
export interface ChangePasswordParam {
	/**
	 * User's current password.
	 */
	password: string;

	/**
	 * New password to give to user.
	 */
	newPassword: string;

	/**
	 *
	 */
	confirmPassword: string;
}