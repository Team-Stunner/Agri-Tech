import { useState, useEffect } from 'react';
import axios from 'axios';

interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  icon: string;
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
}

function Weather() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const WEATHER_API_KEY = '96208e3aa15749d6921192747252303';

  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          setError('Unable to get your location. Please enter a city manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=no`
      );

      setWeatherData({
        city: response.data.location.name,
        temperature: Math.round(response.data.current.temp_c),
        humidity: response.data.current.humidity,
        condition: response.data.current.condition.text,
        windSpeed: response.data.current.wind_kph,
        icon: response.data.current.condition.icon
      });

      const forecastData = response.data.forecast.forecastday.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        maxTemp: Math.round(day.day.maxtemp_c),
        minTemp: Math.round(day.day.mintemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon
      }));

      setForecast(forecastData);
    } catch (error: any) {
      setError('Failed to fetch weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=no`
      );

      setWeatherData({
        city: response.data.location.name,
        temperature: Math.round(response.data.current.temp_c),
        humidity: response.data.current.humidity,
        condition: response.data.current.condition.text,
        windSpeed: response.data.current.wind_kph,
        icon: response.data.current.condition.icon
      });

      const forecastData = response.data.forecast.forecastday.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        maxTemp: Math.round(day.day.maxtemp_c),
        minTemp: Math.round(day.day.mintemp_c),
        condition: day.day.condition.text,
        icon: day.day.condition.icon
      }));

      setForecast(forecastData);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('City not found. Please check the spelling and try again.');
      } else {
        setError('Failed to fetch weather data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  return (
    <div className="container mx-auto px-4 py-8 font-poppins">
      <h1 className="text-4xl font-bold text-green-700 mb-8 text-center animate-fade-in">
        Weather Information
      </h1>

      <div className="max-w-md mx-auto mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 text-gray-700 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
            ) : (
              'Search Weather'
            )}
          </button>
        </form>

        {error && (
          <div className="text-red-600 mt-4 text-center">
            {error}
          </div>
        )}
      </div>

      {weatherData && (
        <div className="max-w-4xl mx-auto">
          {/* Current Weather */}
          <div className="bg-white p-6 rounded-lg card-shadow animate-fade-in mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src={weatherData.icon}
                alt={weatherData.condition}
                className="w-20 h-20"
              />
            </div>
            <h2 className="text-2xl text-gray-700 font-semibold text-center mb-4">{weatherData.city}</h2>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-gray-700 text-center mb-4">{weatherData.temperature}°C</p>
              <p className="text-gray-600 text-center capitalize">{weatherData.condition}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-gray-500">Humidity</p>
                  <p className="text-xl text-gray-700 font-semibold">{weatherData.humidity}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Wind Speed</p>
                  <p className="text-xl text-gray-700 font-semibold">{weatherData.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-white p-6 rounded-lg card-shadow animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">7-Day Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{day.date}</p>
                  <img src={day.icon} alt={day.condition} className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm text-gray-800">{day.maxTemp}°C</p>
                  <p className="text-xs text-gray-600">{day.minTemp}°C</p>
                  <p className="text-xs text-gray-500 mt-1">{day.condition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!weatherData && !loading && !error && (
        <div className="text-center text-xl text-gray-600 mt-8">
          Fetching your location's weather...
        </div>
      )}
    </div>
  );
}

export default Weather;