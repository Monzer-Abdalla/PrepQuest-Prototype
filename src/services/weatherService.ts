export interface AlertData {
  title: string;
  message: string;
  keywords: string[];
}

export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windKph: number;
  conditionId: number;
}

export interface WeatherResult {
  weather: WeatherData;
  alert: AlertData | null;
}

const OWM_KEY = process.env.EXPO_PUBLIC_OWM_KEY;

export const MOCK_ALERT: AlertData = {
  title: "Flash Flood Warning",
  message: "Heavy rain expected in your area. Check your emergency kit now.",
  keywords: ["water", "bag", "shelter", "bottle", "flood", "kit"],
};

function deriveAlert(id: number, temp: number, description: string): AlertData | null {
  if ([731, 751, 761, 762].includes(id)) {
    return {
      title: "Dust Storm Warning",
      message: "Dust storm conditions detected. Stay indoors, seal windows, and store water.",
      keywords: ["mask", "water", "shelter", "bottle", "indoor", "kit"],
    };
  }
  if (id >= 200 && id < 300) {
    return {
      title: "Thunderstorm Warning",
      message: "Thunderstorms expected in your area. Stay indoors and check your emergency kit.",
      keywords: ["torch", "battery", "radio", "shelter", "kit", "flashlight"],
    };
  }
  if (id >= 500 && id < 600) {
    return {
      title: "Heavy Rain Warning",
      message: `Rainfall detected (${description}). Risk of flooding — check your kit.`,
      keywords: ["water", "bag", "shelter", "bottle", "kit", "torch"],
    };
  }
  if (temp >= 38) {
    return {
      title: `Extreme Heat Warning — ${Math.round(temp)}°C`,
      message: "Dangerous heat levels detected. Stay hydrated and check your medical supplies.",
      keywords: ["water", "medical", "health", "bottle", "kit", "first aid"],
    };
  }
  return null;
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherResult | null> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const weatherArr = data.weather;
    const firstCondition = weatherArr && weatherArr.length > 0 ? weatherArr[0] : null;
    const id: number = firstCondition ? firstCondition.id : 800;
    const description: string = firstCondition ? firstCondition.description : "clear sky";
    const main = data.main || {};
    const temp: number = main.temp != null ? main.temp : 20;
    const feelsLike: number = main.feels_like != null ? main.feels_like : temp;
    const humidity: number = main.humidity != null ? main.humidity : 0;
    const windMs: number = data.wind && data.wind.speed != null ? data.wind.speed : 0;

    const weather: WeatherData = {
      city: data.name || "Your Location",
      temp: Math.round(temp),
      feelsLike: Math.round(feelsLike),
      description,
      humidity,
      windKph: Math.round(windMs * 3.6),
      conditionId: id,
    };

    return {
      weather,
      alert: deriveAlert(id, temp, description),
    };
  } catch {
    return null;
  }
}
