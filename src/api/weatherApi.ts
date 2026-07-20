import { WeatherData } from '../navigation/types';

// ─── Mock Weather Data ─────────────────────────────────────────────────────────
const MOCK_WEATHER: WeatherData = {
  location: 'Pune, Maharashtra',
  temperature: 28,
  feelsLike: 31,
  humidity: 72,
  windSpeed: 14,
  description: 'Partly Cloudy',
  icon: '⛅',
  uvIndex: 6,
  visibility: 8.5,
  forecast: [
    { day: 'Today',  high: 30, low: 22, icon: '⛅', description: 'Partly Cloudy', rainChance: 20 },
    { day: 'Tue',    high: 27, low: 20, icon: '🌧️', description: 'Light Rain',    rainChance: 75 },
    { day: 'Wed',    high: 25, low: 19, icon: '🌩️', description: 'Thunderstorm',  rainChance: 90 },
    { day: 'Thu',    high: 28, low: 21, icon: '🌤️', description: 'Mostly Sunny',  rainChance: 10 },
    { day: 'Fri',    high: 32, low: 24, icon: '☀️', description: 'Sunny',          rainChance: 5  },
    { day: 'Sat',    high: 29, low: 22, icon: '⛅', description: 'Partly Cloudy', rainChance: 30 },
    { day: 'Sun',    high: 26, low: 20, icon: '🌦️', description: 'Showers',       rainChance: 65 },
  ],
};

export const getWeather = async (lat?: number, lon?: number): Promise<WeatherData> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return MOCK_WEATHER;
};

// ─── REAL OpenWeatherMap API (plug in your key) ────────────────────────────────
export const getWeatherReal = async (lat: number, lon: number, apiKey: string): Promise<WeatherData> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=7`
  );
  const data = await response.json();

  return {
    location: `${data.city.name}, ${data.city.country}`,
    temperature: Math.round(data.list[0].main.temp),
    feelsLike: Math.round(data.list[0].main.feels_like),
    humidity: data.list[0].main.humidity,
    windSpeed: Math.round(data.list[0].wind.speed * 3.6),
    description: data.list[0].weather[0].description,
    icon: '⛅',
    uvIndex: 5,
    visibility: (data.list[0].visibility || 10000) / 1000,
    forecast: data.list.slice(0, 7).map((item: any, i: number) => ({
      day: i === 0 ? 'Today' : new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short' }),
      high: Math.round(item.main.temp_max),
      low: Math.round(item.main.temp_min),
      icon: '⛅',
      description: item.weather[0].description,
      rainChance: Math.round((item.pop || 0) * 100),
    })),
  };
};

// ─── Crop Advisories based on weather ─────────────────────────────────────────
export const getCropAdvisory = (weather: WeatherData): string[] => {
  const advisories: string[] = [];
  if (weather.humidity > 80) advisories.push('🌿 High humidity — watch for fungal diseases. Apply preventive fungicide.');
  if (weather.humidity < 40) advisories.push('💧 Low humidity — increase irrigation frequency for sensitive crops.');
  if (weather.temperature > 38) advisories.push('🌡️ Heat stress alert! Use mulch to protect roots and irrigate in evening.');
  if (weather.temperature < 15) advisories.push('❄️ Cold night ahead. Cover seedlings and young plants with cloth.');
  const rainDay = weather.forecast.find(f => f.rainChance > 70);
  if (rainDay) advisories.push(`🌧️ Rain expected on ${rainDay.day} (${rainDay.rainChance}%). Avoid fertilizer application.`);
  if (weather.windSpeed > 30) advisories.push('💨 Strong winds forecasted. Stake tall plants and tie fruit-laden branches.');
  if (weather.uvIndex > 8) advisories.push('☀️ High UV index. Field work recommended before 10 AM or after 4 PM.');
  if (advisories.length === 0) advisories.push('✅ Weather conditions are favorable for most field activities today.');
  return advisories;
};
