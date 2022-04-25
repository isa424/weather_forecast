import format from 'date-fns/format';
import fetch from 'isomorphic-fetch';
import React, { useEffect, useMemo, useState } from 'react';
import useGeolocation from 'react-hook-geolocation';
import { IAddress, IResponse } from './types';
import useInterval from './useInterval';

const capitalize = (s: string) => {
	return s[0].toUpperCase() + s.slice(1);
}

function App() {
	const [latitude, setLatitude] = useState<number | null>(null);
	const [longitude, setLongitude] = useState<number | null>(null);
	const [data, setData] = useState<IResponse | undefined>();
	const [address, setAddress] = useState<string>('');
	const geolocation = useGeolocation();

	const fetchData = async () => {
		try {
			if (latitude == null || longitude == null) {
				return;
			}

			const params: Record<string, string | number | undefined> = {
				lat: Math.ceil(latitude),
				lon: Math.ceil(longitude),
				appid: process.env.REACT_APP_API_KEY,
				lang: 'en',
				units: 'metric',
				exclude: 'minutely,hourly,alerts',
			};

			const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');

			const url = `https://api.openweathermap.org/data/2.5/onecall?${query}`;
			const response = await fetch(url, {
				credentials: 'omit',
			});
			let data;

			if (response.ok) {
				data = await response.json() as IResponse;
			}

			console.log(data);
			setData(data);
		} catch (err) {
			console.error(err);
		}
	}

	const fetchAddress = async () => {
		try {
			if (latitude == null || longitude == null) {
				return;
			}

			const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
			const res = await fetch(url);
			const data = await res.json() as IAddress;

			console.log(data);
			setAddress(`${data.principalSubdivision}, ${data.countryName}`);
		} catch (err) {
			console.error(err);
		}
	}

	const days = useMemo(() => data ? data.daily.slice(0, 7) : [], [data]);

	const currentTemp = useMemo(() => data ? Math.ceil(data.current.temp) : 0, [data]);

	const currentDesc = useMemo(() => data ? capitalize(data.current.weather[0].description) : '', [data]);

	// Set latitude and longitude
	useEffect(() => {
		if (!geolocation.latitude || !geolocation.longitude) {
			return;
		}

		setLatitude(geolocation.latitude);
		setLongitude(geolocation.longitude);
	}, [geolocation.latitude, geolocation.longitude]);

	// Fetch necessary date on page load
	useEffect(() => {
		fetchAddress();
		fetchData();
	}, [latitude, longitude]);

	// Fetch data in intervals or 1 minute
	useInterval(() => {
		fetchData();
	}, 60 * 1000);

	const error = useMemo(() => (
		<div className={'text-white font-bold text-lg'}>Please reset the Location permission and reload the page!</div>
	), []);

	const content = useMemo(() => data ? (
		<div
			className={'flex flex-col w-[800px] h-[400px] items-around border border-blue-600 rounded-3xl p-10 bg-blue-600 drop-shadow-xl shadow-xl shadow-blue-600/50 gap-10'}>
			<div className={'flex flex-1 justify-between'}>
				<div className={'flex flex-col justify-between'}>
					<span className={'text-xl font-bold'}>{address}</span>
					<span className={'text-8xl'}>{currentTemp}&deg;</span>
				</div>
				<div className={'flex flex-col justify-between'}>
					<div className={'flex justify-end left-7 relative'}>
						<img
							src={`https://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`}
							alt={data.current.weather[0].description}
							title={data.current.weather[0].description}
						/>
					</div>
					<span className={'text-2xl text-right'}>{currentDesc}</span>
				</div>
			</div>

			<div className={'flex flex-1 justify-between'}>
				{days.map((d, i) => (
					<div key={i} className={'flex flex-col justify-between items-center'}>
						<span className="text-xl">{format(d.dt * 1000, 'eee')}</span>
						<span className={'text-xs'}>{format(d.dt * 1000, 'dd MMM')}</span>
						<div className={'h-[50px] w-[50px]'}>
							<img
								src={`https://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}.png`}
								alt={d.weather[0].description}
								title={d.weather[0].description}
							/>
						</div>
						<div
							className={'text-sm flex gap-1'}
						>
							<span title={'Day'}>{Math.ceil(d.temp.day)}&deg;</span>
							<span>/</span>
							<span title={'Night'}>{Math.ceil(d.temp.night)}&deg;</span>
						</div>
					</div>
				))}
			</div>
		</div>
	) : (
		<div></div>
	), [address, currentDesc, currentTemp, data, days]);

	return (
		<div
			className={'flex justify-center items-center h-full w-full text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500'}
		>
			{geolocation.error ? error : content}
		</div>
	);
}

export default App;
