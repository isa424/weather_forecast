type IWeather = {
	id: number,
	main: 'Clouds' | 'Snow' | 'Extreme' | 'Thunderstorm' | 'Drizzle' | 'Rain' | 'Clear',
	description: string,
	icon: string
}

export type IAddress = {
	countryName: string,
	principalSubdivision: string
};

type IData = {
	dt: number,
	sunrise: number,
	sunset: number,
	temp: number,
	feels_like: number,
	pressure: number,
	humidity: number,
	dew_point: number,
	uvi: number,
	clouds: number,
	visibility: number,
	wind_speed: number,
	wind_deg: number,
	weather: IWeather[]
}

export type IResponse = {
	lat: number,
	lon: number,
	timezone: string,
	timezone_offset: number,
	current: IData,
	minutely: {
		dt: number,
		precipitation: number
	}[],
	hourly: (IData & {
		wind_gust: number,
		pop: number,
		rain: {
			'1h': number
		}
	})[],
	daily: (Omit<IData, 'temp' | 'feels_like'> & {
		moonrise: number,
		moonset: number,
		moon_phase: number,
		temp: {
			day: number,
			min: number,
			max: number,
			night: number,
			eve: number,
			morn: number
		},
		feels_like: {
			day: number,
			night: number,
			eve: number,
			morn: number
		},
		wind_gust: number,
		pop: number,
		rain: number,
	})[]
};
