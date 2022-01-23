import ldap from 'ldapjs';
import type { User } from '$lib/models/user';
import { readFileSync } from 'node:fs';
import { ssha } from './ssha';

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
	// ${userName} will be replaced by value from signIn page.
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

	// User to bind for reading db.
	// Default: [none]
	LDAP_BIND_DN,

	// Password to bind for reading db.
	// Default: [none]
	LDAP_BIND_PASSWORD
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
 * Wraps client.bind in a promise,
 *
 * @param client Client instance.
 * @param dn distinguished name of user to bind.
 * @param password password to bind.
 * @returns Promise
 */
const bind = (client: ldap.Client, dn: string, password: string) =>
	new Promise((resolve, reject) => {
		client.bind(dn, password, (err, result) => {
			if (err) {
				return reject(err);
			}
			return resolve(result);
		});
	});

/**
 * Wraps client.unbind in a promise.
 * @param client
 * @returns Promise to resolve on completion.
 */
const unbind = (client: ldap.Client) =>
	new Promise<void>((resolve) => client.unbind(() => resolve()));

/**
 * Wraps client.modify in a promise.
 * @param client Client to wrap
 * @param dn Distinguished name of element to modify
 * @param changes one or more changes to apply
 * @returns Promise resolved when modifications are complete.
 */
const modify = (client: ldap.Client, dn: string, ...changes: ldap.Change[]) =>
	 new Promise<void>((resolve, reject) => {
			client.modify(dn, changes, (err) => {
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});


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
				attributes: ['dn', LDAP_ATTR_USER_NAME, LDAP_ATTR_DISPLAY_NAME, LDAP_ATTR_EMAIL]
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
	try {
		await bind(client, user.id, password);
		await unbind(client);
		return true;
	} catch (err) {
		return false;
	}
};

/**
 * Executes sign-in operation for the supplied user.
 *
 * @param userName canonical name of the user to validate.
 * @param password password of the user to validate.
 * @returns true if user is found and password is validated. Otherwise false.
 */
export const signIn = async (userName: string, password: string): Promise<User> => {
	const client = ldap.createClient(options);
	try {
		if (LDAP_BIND_DN && LDAP_BIND_PASSWORD) {
			await bind(client, LDAP_BIND_DN, LDAP_BIND_PASSWORD);
		}
		const user = await findUser(client, userName);
		if (user && await validatePassword(client, user, password)) {
			return user;
		}
	} catch (err) {
		// Eat it as a failed login
	}
	finally {
		await unbind(client);
		client.destroy();
	}
	return null;
};

/**
 * Updates user's password
 * @param userName
 * @param password
 * @param newPassword
 * @returns true if password was updated, otherwise false.
 */
export const changePassword = async (
	user: User,
	password: string,
	newPassword: string
): Promise<boolean> => {
	const client = ldap.createClient(options);
	try {
		const change = new ldap.Change({
			operation: 'replace',
			modification: {userPassword: ssha(newPassword)}
		});
		await bind(client, user.id, password);
		await modify(client, user.id, change);
		return true;
	}
	catch (err) {
		return false;
	}
	finally {
		await unbind(client);
		client.destroy();
	}
};
