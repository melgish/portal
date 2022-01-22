import { writable } from 'svelte/store';
import { browser } from '$app/env';

/**
 * Load value from local storage
 * @param key
 * @param defaultValue
 * @returns
 */
const load = (key: string, defaultValue: string) => {
	if (browser) {
		return window.localStorage.getItem(key) ?? defaultValue;
	}
	return defaultValue;
};

/**
 * Save value to local storage.
 * @param key
 * @param value
 */
const save = (key: string, value: string) => {
	if (browser) {
		window.localStorage.setItem(key, value);
	}
};

export const DEFAULT_THEME = 'blue';
export const theme = writable<string>(load('theme', DEFAULT_THEME));
theme.subscribe((value) => save('theme', value));

export const DEFAULT_CITY = '4163971';
export const city = writable<string>(load('city', DEFAULT_CITY));
city.subscribe((value) => save('city', value));
