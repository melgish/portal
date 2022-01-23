import { createClient } from 'redis';
import { v4 } from 'uuid';

const name = 'portal_session';
const maxAge = 60 * 60 * 24 * 7;

const {
	// Connection string for REDIS server
	// Default redis://redis.lan:6379
	REDIS_HOST = 'redis://redis.lan:6379'
	//
} = process.env;

/**
 * Creates and connects to redis server.
 * @returns
 */
const connect = async () => {
	const client = createClient({ url: REDIS_HOST });
	await client.connect();
	return client;
};

/**
 * Create a new session using  the supplied value.
 *
 * @param value to add
 * @returns id added to session
 */
const create = async <T>(value: T): Promise<string> => {
	const json = JSON.stringify(value);
	const sessionId = `portal.${v4()}`;
	const client = await connect();
	await client.set(sessionId, json, { EX: maxAge, NX: true });
	return sessionId;
};

const del = async (sessionId: string): Promise<void> => {
	const client = await connect();
	await client.del(sessionId);
};

const get = async <T>(sessionId: string): Promise<T | null> => {
	const client = await connect();
	const json = await client.get(sessionId);
	return (json && JSON.parse(json)) || null;
};

export const Redis = { create, del, maxAge, get, name };
