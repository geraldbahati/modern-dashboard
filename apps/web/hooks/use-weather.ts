import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  isDay: boolean;
  weatherCode: number;
}

interface WeatherError {
  message: string;
}

// WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs
export const getWeatherCondition = (code: number): string => {
  if (code === 0) return "Clear sky";
  if (code === 1 || code === 2 || code === 3)
    return "Mainly clear, partly cloudy, and overcast";
  if (code === 45 || code === 48) return "Fog and depositing rime fog";
  if (code === 51 || code === 53 || code === 55)
    return "Drizzle: Light, moderate, and dense intensity";
  if (code === 56 || code === 57)
    return "Freezing Drizzle: Light and dense intensity";
  if (code === 61 || code === 63 || code === 65)
    return "Rain: Slight, moderate and heavy intensity";
  if (code === 66 || code === 67)
    return "Freezing Rain: Light and heavy intensity";
  if (code === 71 || code === 73 || code === 75)
    return "Snow fall: Slight, moderate, and heavy intensity";
  if (code === 77) return "Snow grains";
  if (code === 80 || code === 81 || code === 82)
    return "Rain showers: Slight, moderate, and violent";
  if (code === 85 || code === 86) return "Snow showers slight and heavy";
  if (code === 95) return "Thunderstorm: Slight or moderate";
  if (code === 96 || code === 99)
    return "Thunderstorm with slight and heavy hail";
  return "Unknown";
};

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<WeatherError | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({ message: "Geolocation is not supported by your browser" });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Fetch weather data from Open-Meteo
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,weather_code&timezone=auto`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch weather data");
          }

          const data = await response.json();

          // We can use a reverse geocoding API here if we want the exact city name,
          // but for now we'll use the timezone or a generic label.
          // Open-Meteo returns timezone like "Africa/Nairobi"
          const location =
            data.timezone.split("/")[1]?.replace(/_/g, " ") || "Local";

          setWeather({
            temperature: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weather_code),
            location: location,
            isDay: data.current.is_day === 1,
            weatherCode: data.current.weather_code,
          });
        } catch (err) {
          setError({ message: "Failed to fetch weather info" });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError({ message: "Location permission denied" });
        setLoading(false);
      }
    );
  }, []);

  return { weather, loading, error };
}
