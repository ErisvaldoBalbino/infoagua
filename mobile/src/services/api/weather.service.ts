import { api } from "./client";

export interface WeatherResponse {
  temperature: number;
  description: string;
  rainProbability: number;
  icon: string;
  datetime: string;
}

export const weatherService = {
  getForecast: (lat: number, lon: number) =>
    api
      .get<WeatherResponse>("/weather", { params: { lat, lon } })
      .then((r) => r.data),
};
