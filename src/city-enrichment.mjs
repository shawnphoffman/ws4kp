// Enrich city data with NOAA grid point information at runtime
// Reuses the same API pattern as datagenerators/travelcities.mjs

const USER_AGENT = '(WeatherStar 4000+, ws4000@netbymatt.com)';
const CHUNK_SIZE = 5;
const API_BASE = 'https://api.weather.gov/points';

// Fetch NOAA grid point data for a single lat/lon
const fetchGridPoint = async (lat, lon) => {
	const response = await fetch(`${API_BASE}/${lat},${lon}`, {
		headers: { 'User-Agent': USER_AGENT },
	});
	if (!response.ok) {
		throw new Error(`NOAA API error: ${response.status} for ${lat},${lon}`);
	}
	const data = await response.json();
	return {
		x: data.properties.gridX,
		y: data.properties.gridY,
		wfo: data.properties.gridId,
	};
};

// Normalize city format: accept either {Name, Latitude, Longitude} or {city, lat, lon}
const normalizeLat = (city) => city.Latitude ?? city.lat;
const normalizeLon = (city) => city.Longitude ?? city.lon;

// Enrich an array of cities with NOAA grid point data
// Skips cities that already have a valid `point` property
const enrichCities = async (cities) => {
	const result = [];
	const chunks = [];

	// Split into chunks to avoid overwhelming the API
	for (let i = 0; i < cities.length; i += CHUNK_SIZE) {
		chunks.push(cities.slice(i, i + CHUNK_SIZE));
	}

	for (let i = 0; i < chunks.length; i += 1) {
		const cityChunk = chunks[i];

		// eslint-disable-next-line no-await-in-loop
		const chunkResult = await Promise.all(cityChunk.map(async (city) => {
			// Skip enrichment if city already has point data
			if (city.point?.x !== undefined && city.point?.y !== undefined && city.point?.wfo) {
				return city;
			}

			const lat = normalizeLat(city);
			const lon = normalizeLon(city);

			if (lat === undefined || lon === undefined) {
				console.error('City missing lat/lon:', city);
				return city;
			}

			try {
				const point = await fetchGridPoint(lat, lon);
				return { ...city, point };
			} catch (e) {
				console.error(`Failed to enrich city:`, city, e.message);
				return city;
			}
		}));

		result.push(...chunkResult);
	}

	return result;
};

export { enrichCities };
