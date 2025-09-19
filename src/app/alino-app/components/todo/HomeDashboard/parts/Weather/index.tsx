"use client";

import React, { useEffect, useState } from "react";
import styles from "./Weather.module.css";

type WeatherState = {
  temperature: number | null;
  description: string | null;
  emoji: string | null;
  location: string | null;
  loading: boolean;
  error: string | null;
};

const DEFAULT_LAT = -31.4167;
const DEFAULT_LON = -64.1833;

function mapWeatherCodeToSimple(code: number, isDay: boolean) {
  if (code === 0) return { desc: "Despejado", emoji: isDay ? "☀️" : "🌙" };
  if (code >= 1 && code <= 3)
    return {
      desc: "Parcialmente nublado",
      emoji: isDay ? "⛅" : "☁️",
    };
  if (code === 45 || code === 48) return { desc: "Niebla", emoji: "🌫️" };
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82))
    return { desc: "Llovizna / Chubascos", emoji: isDay ? "🌦️" : "🌧️" };
  if ((code >= 61 && code <= 67) || code === 95)
    return { desc: "Lluvia", emoji: "🌧️" };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return { desc: "Nieve", emoji: "🌨️" };
  if (code >= 96 && code <= 99) return { desc: "Tormenta", emoji: "⛈️" };
  return { desc: "Condición desconocida", emoji: "❓" };
}

export const Weather: React.FC<{ label?: string }> = ({ label }) => {
  const [state, setState] = useState<WeatherState>({
    temperature: null,
    description: null,
    emoji: null,
    location: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const cw = data?.current_weather;
        if (!cw) throw new Error("No hay datos de clima actual");

        const temp =
          typeof cw.temperature === "number"
            ? Math.round(cw.temperature)
            : null;
        const code = typeof cw.weathercode === "number" ? cw.weathercode : -1;
        const currentTimeStr = cw.time;
        let isDay = true;

        try {
          const daily = data?.daily;
          const dailyTimes: string[] | undefined = daily?.time;
          const sunrises: string[] | undefined = daily?.sunrise;
          const sunsets: string[] | undefined = daily?.sunset;

          if (dailyTimes && sunrises && sunsets && Array.isArray(dailyTimes)) {
            const currentDate = currentTimeStr.split("T")[0]; // "YYYY-MM-DD"
            const dayIndex = dailyTimes.findIndex(
              (t: string) => t === currentDate
            );

            if (dayIndex >= 0) {
              const sunriseStr = sunrises[dayIndex];
              const sunsetStr = sunsets[dayIndex];

              const currentDateTime = new Date(currentTimeStr);
              const sunriseDate = new Date(sunriseStr);
              const sunsetDate = new Date(sunsetStr);

              isDay =
                currentDateTime >= sunriseDate && currentDateTime < sunsetDate;
            } else {
              const now = new Date(currentTimeStr);
              const hour = now.getHours();
              isDay = hour >= 6 && hour < 20;
            }
          } else {
            const now = new Date(cw.time ? cw.time : undefined);
            const hour = now.getHours();
            isDay = hour >= 6 && hour < 20;
          }
        } catch {
          const now = new Date();
          const hour = now.getHours();
          isDay = hour >= 6 && hour < 20;
        }

        const mapped = mapWeatherCodeToSimple(code, isDay);

        return {
          temperature: temp,
          description: mapped.desc,
          emoji: mapped.emoji,
          error: null as string | null,
        };
      } catch (err: any) {
        return {
          temperature: null,
          description: null,
          emoji: null,
          error: err?.message ?? "Error al obtener clima",
        };
      }
    };

    const reverseGeocode = async (lat: number, lon: number) => {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=es`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Geo HTTP ${res.status}`);
        const data = await res.json();
        const first = data?.results?.[0];
        if (!first) throw new Error("Sin resultados de geocoding");
        const parts = [first.name, first.admin1, first.country].filter(Boolean);
        return parts.join(", ");
      } catch {
        return null;
      }
    };

    const fetchCoordsByIP = async (): Promise<{
      lat: number;
      lon: number;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } | null> => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) return null;
        const data = await res.json();
        const lat = Number(data.latitude ?? data.lat);
        const lon = Number(data.longitude ?? data.lon);
        const city = data.city ?? null;
        const region = data.region ?? data.region_name ?? null;
        const country = data.country_name ?? null;
        if (Number.isFinite(lat) && Number.isFinite(lon))
          return { lat, lon, city, region, country };
        return null;
      } catch {
        return null;
      }
    };

    const tryGeolocationThenFetch = async () => {
      let coords: { lat: number; lon: number } | null = null;
      let ipInfo: {
        city?: string | null;
        region?: string | null;
        country?: string | null;
      } | null = null;

      let resolved = false;
      const geoTimeout = setTimeout(async () => {
        if (resolved) return;
        resolved = true;
        const ipCoords = await fetchCoordsByIP();
        if (ipCoords) {
          coords = { lat: ipCoords.lat, lon: ipCoords.lon };
          ipInfo = {
            city: ipCoords.city,
            region: ipCoords.region,
            country: ipCoords.country,
          };
        } else {
          coords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
        }
      }, 4000);

      const ipCoords = await fetchCoordsByIP();
      if (ipCoords) {
        coords = { lat: ipCoords.lat, lon: ipCoords.lon };
        ipInfo = {
          city: ipCoords.city,
          region: ipCoords.region,
          country: ipCoords.country,
        };
      } else {
        coords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
      }

      if (!coords) {
        coords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
      }

      const [w, geoName] = await Promise.all([
        fetchWeather(coords.lat, coords.lon),
        (async () => {
          if (ipInfo?.city) {
            const parts = [ipInfo.city, ipInfo.region, ipInfo.country].filter(
              Boolean
            );
            return parts.join(", ");
          }
          const g = await reverseGeocode(coords.lat, coords.lon);
          return g;
        })(),
      ]);

      if (!mounted) return;

      setState({
        temperature: w.temperature,
        description: w.description,
        emoji: w.emoji,
        location:
          label ??
          geoName ??
          (coords.lat === DEFAULT_LAT && coords.lon === DEFAULT_LON
            ? "Córdoba, Argentina"
            : null),
        loading: false,
        error: w.error,
      });
    };

    tryGeolocationThenFetch();

    return () => {
      mounted = false;
    };
  }, [label]);

  return (
    <div className={styles.weatherWidget}>
      {state.loading ? (
        <div className={styles.inner}>Cargando clima…</div>
      ) : state.error ? (
        <div className={styles.inner}>Error: {state.error}</div>
      ) : (
        <>
          <div className={styles.locationHeader}>
            {state.location ?? "Ubicación desconocida"}
          </div>

          <div className={styles.inner}>
            <div className={styles.weatherInfo}>
              <div className={styles.temperature}>
                {state.temperature !== null ? `${state.temperature}°C` : "—"}
              </div>
              <div className={styles.weatherIcon} aria-hidden>
                {state.emoji}
              </div>
              <div className={styles.weatherDescription}>
                {state.description ?? "—"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
