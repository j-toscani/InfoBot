import fetch from "node-fetch";

async function getWeatherData(town: string) {
  const apikey = process.env.WEATHER_API_KEY;
  const response = await fetch(
    `api.openweathermap.org/data/2.5/forecast?q=${town},DE&appid=${apikey}`
  );
  const weatherData = await response.json();
}
