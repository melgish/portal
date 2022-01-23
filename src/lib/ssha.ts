//
// adapted from https://github.com/jmarca/openldap_ssha/blob/master/lib/ssha.js

import { createHash, randomBytes, BinaryToTextEncoding } from "node:crypto"


/**
 * Generate SSHA style encrypted password from supplied values.
 * '
 * @param password password to encode.
 * @param salt pre-defined salt value to use instead of random.
 * @returns
 */
export const ssha = (password: string, salt?: string): string => {
  // Generate random salt when none is supplied.
	salt = salt ?? randomBytes(24).toString('base64');
	// In testing the encoding of must be latin1 (binary) or bind will fail
	const ENCODING = 'latin1' as BinaryToTextEncoding;
	const digest = createHash('sha1')
		.update(password, 'utf-8')
		.update(salt, ENCODING)
		.digest(ENCODING);
	return `{SSHA}${Buffer.from(digest + salt, ENCODING).toString('base64')}`;
}
