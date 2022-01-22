import ldap from 'ldapjs';
import type { User } from '$lib/models/user';
import { readFileSync } from 'fs';

const {
	// Connection string to the LDAP server
	// Default: 'ldap://ldap.lan:1389'
	LDAP_HOST = 'ldap://ldap.lan:1389',

	// For secure connections with questionable certificates.
	// Default: [none]
	LDAP_TLS_CA_FILE,

	// Base DN where users are stored.
	// Default: 'ou=users,dc=example,dc=com'
	LDAP_USERS_DN = 'ou=users,dc=example,dc=com',

	// Filter to locate user in above DN
	// ${userName} will be replaced by value from login page.
	// Default: '(&(objectClass=person)(cn=${userName}))'
	LDAP_USER_FILTER = '(&(objectClass=person)(cn=${userName}))',

	// Attribute to match when searching for users.
	// This should match query used in filter.
	// Default: cn
	LDAP_ATTR_USER_NAME = 'cn',

	// Attribute where user's email address is stored.
	// Default: 'mail'
	LDAP_ATTR_EMAIL = 'mail',

	// Attribute where user's display name is stored.
	// Default: 'displayName'
	LDAP_ATTR_DISPLAY_NAME = 'displayName',

} = process.env;


// Build connection options from environment
const options = (() => {
	const opts: ldap.ClientOptions = {
		url: LDAP_HOST
	};
	if (LDAP_TLS_CA_FILE) {
		opts.tlsOptions = { ca: readFileSync(LDAP_TLS_CA_FILE, 'utf8') };
	}
	return opts;
})();

/**
 * Use supplied LDAP client to lookup a user by their canonical name (cn)
 * @param client
 * @param userName UserName value to search for. (CN)
 * @returns
 */
const findUser = (client: ldap.Client, userName: string): Promise<User | null> => {
	return new Promise((resolve, reject) => {
		client.search(
			// Only users in the users group will be returned
			LDAP_USERS_DN,
			{
				filter: LDAP_USER_FILTER.replace('${userName}', userName),
				scope: 'sub',
				// Only pull in needed values.
				attributes: ["dn", LDAP_ATTR_USER_NAME, LDAP_ATTR_DISPLAY_NAME, LDAP_ATTR_EMAIL]
			},
			[],
			(err, res) => {
				if (err) {
					return reject(err);
				}
				const users = [];
				res.on('searchEntry', (entry) => {
					const {
						dn: id,
						[LDAP_ATTR_USER_NAME]: userName,
						[LDAP_ATTR_EMAIL]: mail,
						[LDAP_ATTR_DISPLAY_NAME]: displayName
					} = entry.object;
					users.push({ displayName, id, mail, userName });
				});
				res.on('end', () => resolve(users[0] ?? null));
			}
		);
	});
};

/**
 * Validate user password.
 * @param client Client to use for validation.
 * @param user User to validate.
 * @param password Password to validate.
 * @returns
 */
const validatePassword = async (
	// ldap client to use for validation
	client: ldap.Client,
	// users distinguished name
	user: User,
	password: string
): Promise<boolean> => {
	return new Promise<boolean>((resolve) => {
		if (!(user && password)) {
			return resolve(false);
		}
		// Use id (dn) to validate the user.
		client.bind(user.id, password, (err) => resolve(!err));
	});
}

/**
 * Executes sign-in operation for the supplied user.
 *
 * @param userName canonical name of the user to validate.
 * @param password password of the user to validate.
 * @returns true if user is found and password is validated. Otherwise false.
 */
export const signIn = async (userName: string, password: string): Promise<User> => {
	const client = ldap.createClient(options);
	const user = await findUser(client, userName);
	if (await validatePassword(client, user, password)) {
		return user;
	}
	return null;
}

/**
 * Updates user's password
 * @param userName
 * @param password
 * @param newPassword
 * @returns true if password was updated, otherwise false.
 */
export const changePassword = async (userName: string, password: string, newPassword: string): Promise<boolean> => {
	const client = ldap.createClient(options);
	const user = await findUser(client, userName);
	if (await validatePassword(client, user, password)) {
		// TODO: save new password.
		return true;
	}
	return false;

}
