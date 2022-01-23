import { stringify } from 'query-string';
const API = 'https://api.openweathermap.org/data/2.5/weather';
const ICON = 'http://openweathermap.org/img/wn';

const {
	// Weather API key from openweathermap.
	WEATHER_APPID
} = process.env;

const PARAMS = {
	appid: WEATHER_APPID,
	lang: 'en',
	units: 'imperial'
};

export const getWeatherByCity = async (id: string) => {
	const params = stringify({ id, ...PARAMS });

	const rs = await fetch(`${API}?${params}`);
	const data = await rs.json();
	return {
		// Only need the interesting data.
		name: data?.name ?? 'Error',
		temp: data?.main?.temp,
		icon: `${ICON}/${data?.weather?.[0].icon}@2x.png`,
		text: data?.weather?.[0].description,
		sunrise: data?.sys?.sunrise,
		sunset: data?.sys?.sunset
	};
};
