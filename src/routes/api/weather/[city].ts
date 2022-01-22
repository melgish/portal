import type { RequestEvent } from '@sveltejs/kit';
import { getWeatherByCity } from '$lib/weather';
import { chain } from '$lib/chain';
import { forbid } from '$lib/forbid';

export const get = chain(forbid, async (event: RequestEvent) => {
	const { city } = event.params;
	try {
		const body = await getWeatherByCity(city);
		return {
			status: 200,
			body
		};
	} catch (error) {
		return {
			status: 200,
			body: {
				name: 'Error',
				temp: 0,
				icon: null,
				text: 'Weather Unavailable',
				sunrise: 0,
				sunset: 0
			}
		};
	}
});
