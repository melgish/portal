import JSON5 from 'json5';
import raw from '$lib/links.json5?raw';
import { chain } from '$lib/chain';
import { forbid } from '$lib/forbid';

const LINKS = {
	status: 200,
	body: JSON5.parse(raw)
};

export const get = chain(forbid, () => LINKS);
