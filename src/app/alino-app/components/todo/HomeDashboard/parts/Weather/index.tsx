"use client";

import React, { useEffect, useState } from "react";
import {
  Night,
  Sunny,
  CloudyDay,
  CloudyNight,
  RainyDay,
  RainyNight,
  Rainy,
  Stormy,
  Snowy,
  Foggy,
  Unknown,
  Navigation,
} from "@/components/ui/icons/weather-icons";
import styles from "./Weather.module.css";
import { LoadingIcon } from "@/components/ui/icons/icons";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";

import { WeatherPreview } from "./WeatherPreview";

type WeatherState = {
  temperature: number | null;
  tempMin: number | null;
  tempMax: number | null;
  description: string | null;
  emoji: React.ReactNode | null;
  location: string | null;
  loading: boolean;
  error: string | null;
  weatherType:
    | "sunny"
    | "cloudy-day"
    | "cloudy-night"
    | "rainy"
    | "rainy-day"
    | "rainy-night"
    | "stormy"
    | "snowy"
    | "foggy"
    | "night"
    | "default";
  hourlyForecast: HourlyData[];
};

type HourlyData = {
  time: string;
  temperature: number;
  weatherCode: number;
  emoji: React.ReactNode;
  isDay: boolean;
};

const validTypes: WeatherState["weatherType"][] = [
  "sunny",
  "cloudy-day",
  "cloudy-night",
  "rainy",
  "rainy-day",
  "rainy-night",
  "stormy",
  "snowy",
  "foggy",
  "night",
  "default",
];

const DEFAULT_LAT = -31.4167;
const DEFAULT_LON = -64.1833;

const IconStyles = {
  stroke: "#ffffff",
  strokeWidth: 2,
  width: "18px",
  height: "18px",
} as React.CSSProperties;

function mapWeatherCodeToSimple(code: number, isDay: boolean) {
  let weatherType: WeatherState["weatherType"] = "default";

  if (code === 0) {
    weatherType = isDay ? "sunny" : "night";
    return {
      desc: isDay ? "Despejado" : "Despejado",
      emoji: isDay ? (
        <Sunny style={{ fill: "#ffffff", ...IconStyles }} />
      ) : (
        <Night style={{ fill: "#ffffff", ...IconStyles }} />
      ),
      weatherType,
    };
  }
  if (code >= 1 && code <= 3) {
    weatherType = isDay ? "cloudy-day" : "cloudy-night";
    return {
      desc: "Parcialmente nublado",
      emoji: isDay ? (
        <CloudyDay style={IconStyles} />
      ) : (
        <CloudyNight style={IconStyles} />
      ),
      weatherType,
    };
  }
  if (code === 45 || code === 48) {
    weatherType = "foggy";
    return {
      desc: "Niebla",
      emoji: <Foggy style={IconStyles} />,
      weatherType,
    };
  }
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) {
    weatherType = isDay ? "rainy-day" : "rainy-night";
    return {
      desc: "Llovizna / Chubascos",
      emoji: isDay ? (
        <RainyDay style={IconStyles} />
      ) : (
        <RainyNight style={IconStyles} />
      ),
      weatherType,
    };
  }
  if ((code >= 61 && code <= 67) || code === 95) {
    weatherType = "rainy";
    return {
      desc: "Lluvia",
      emoji: <Rainy style={IconStyles} />,
      weatherType,
    };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    weatherType = "snowy";
    return {
      desc: "Nieve",
      emoji: <Snowy style={IconStyles} />,
      weatherType,
    };
  }
  if (code >= 96 && code <= 99) {
    weatherType = "stormy";
    return {
      desc: "Tormenta",
      emoji: <Stormy style={IconStyles} />,
      weatherType,
    };
  }
  return {
    desc: "Condición desconocida",
    emoji: <Unknown style={IconStyles} />,
    weatherType: "default",
  };
}

function getHourlyEmoji(code: number, isDay: boolean): React.ReactNode {
  if (code === 0)
    return isDay ? (
      <Sunny style={{ fill: "#ffffff", ...IconStyles }} />
    ) : (
      <Night style={{ fill: "#ffffff", ...IconStyles }} />
    );
  if (code >= 1 && code <= 3)
    return isDay ? (
      <CloudyDay style={IconStyles} />
    ) : (
      <CloudyNight style={IconStyles} />
    );
  if (code === 45 || code === 48) return <Foggy style={IconStyles} />;
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82))
    return isDay ? (
      <RainyDay style={IconStyles} />
    ) : (
      <RainyNight style={IconStyles} />
    );
  if ((code >= 61 && code <= 67) || code === 95)
    return <Rainy style={IconStyles} />;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return <Snowy style={IconStyles} />;
  if (code >= 96 && code <= 99) return <Stormy style={IconStyles} />;
  return (
    <Unknown
      style={{
        stroke: "#ffffff",
        strokeWidth: 2,
        width: "20px",
        height: "20px",
      }}
    />
  );
}

export const Weather: React.FC<{ label?: string }> = ({ label }) => {
  const weather = useDashboardStore((state) => state.weather);
  const setWeather = useDashboardStore((state) => state.setWeather);
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!weather.loading && weather.temperature !== null) return;

    let mounted = true;

    const fetchAllData = async () => {
      let coords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
      let geoName: string | null = null;

      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          coords = {
            lat: Number(ipData.latitude ?? ipData.lat),
            lon: Number(ipData.longitude ?? ipData.lon),
          };
          geoName = [ipData.city, ipData.region].filter(Boolean).join(", ");
        }
      } catch (e) {
        console.warn("Weather: IP Geolocation failed", e);
      }

      if (!mounted) return;

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=2`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Weather API Error: ${res.status}`);
        const data = await res.json();

        const cw = data.current_weather;
        const currentTimeStr = cw.time;
        const code = cw.weathercode;
        const temp = Math.round(cw.temperature);

        const daily = data.daily;
        const currentDate = currentTimeStr.split("T")[0];
        const dayIndex = (daily.time as string[]).findIndex(
          (t) => t === currentDate,
        );

        let isDay = true;
        let tempMax = null;
        let tempMin = null;

        if (dayIndex >= 0) {
          tempMax = Math.round(daily.temperature_2m_max[dayIndex]);
          tempMin = Math.round(daily.temperature_2m_min[dayIndex]);
          const sunrise = new Date(daily.sunrise[dayIndex]);
          const sunset = new Date(daily.sunset[dayIndex]);
          const now = new Date(currentTimeStr);
          isDay = now >= sunrise && now < sunset;
        }

        const mapped = mapWeatherCodeToSimple(code, isDay);

        const hourly = data.hourly;
        const hourlyForecast: HourlyData[] = [];
        const now = new Date(currentTimeStr);

        for (
          let i = 0;
          i < hourly.time.length && hourlyForecast.length < 7;
          i++
        ) {
          const hTime = new Date(hourly.time[i]);
          if (hTime > now) {
            const hHour = hTime.getHours();
            const hIsDay = hHour >= 6 && hHour < 20;
            hourlyForecast.push({
              time: hTime.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              temperature: Math.round(hourly.temperature_2m[i]),
              weatherCode: hourly.weathercode[i],
              emoji: getHourlyEmoji(hourly.weathercode[i], hIsDay),
              isDay: hIsDay,
            });
          }
        }

        if (mounted) {
          setWeather({
            ...weather,
            temperature: temp,
            tempMin,
            tempMax,
            description: mapped.desc,
            emoji: mapped.emoji,
            weatherType: mapped.weatherType as
              | "sunny"
              | "cloudy-day"
              | "cloudy-night"
              | "rainy"
              | "rainy-day"
              | "rainy-night"
              | "stormy"
              | "snowy"
              | "foggy"
              | "night"
              | "default",
            location:
              label ??
              geoName ??
              (coords.lat === DEFAULT_LAT ? "Córdoba, AR" : "Tu ubicación"),
            hourlyForecast,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setWeather({
            ...weather,
            loading: false,
            error: (err as Error).message,
          });
        }
      }
    };

    fetchAllData();
    return () => {
      mounted = false;
    };
  }, [label, setWeather, weather.loading, weather.temperature]);

  if (isPreview) {
    return <WeatherPreview />;
  }

  return (
    <div className={`${styles.weatherWidget} ${styles[weather.weatherType]}`}>
      {weather.loading ? (
        <div className={styles.loadingContainer}>
          <LoadingIcon
            style={{
              width: "20px",
              height: "auto",
              stroke: "var(--text-not-available)",
              strokeWidth: "3",
            }}
          />
          <span className={styles.loadingText}>Cargando clima…</span>
        </div>
      ) : weather.error ? (
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>Error al cargar clima</span>
        </div>
      ) : (
        <div className={styles.weatherContainer}>
          <div className={styles.headerWidget}>
            <div className={styles.loctempContainer}>
              <div className={styles.locationHeader}>
                <span className={styles.locationText}>
                  {weather.location ?? "Ubicación desconocida"}
                </span>
                <span className={styles.locationIcon}>
                  <Navigation
                    style={{
                      width: "15px",
                      height: "15px",
                      fill: "#ffffff",
                    }}
                  />
                </span>
              </div>
              <span className={styles.currentTemp}>
                {weather.temperature !== null ? `${weather.temperature}°` : "—"}
              </span>
            </div>
            <div className={styles.desctempContainer}>
              {weather.emoji}
              <div className={styles.weatherDescription}>
                {weather.description ?? "—"}
              </div>
              <p>
                Máx.: {weather.tempMax !== null ? `${weather.tempMax}°` : "—"}{" "}
                Mín.: {weather.tempMin !== null ? `${weather.tempMin}°` : "—"}
              </p>
            </div>
          </div>

          {weather.hourlyForecast.length > 0 && (
            <div className={styles.hourlyForecast}>
              {weather.hourlyForecast.slice(0, 7).map((hour, index) => (
                <div key={index} className={styles.hourlyItem}>
                  <span className={styles.hourlyTime}>
                    {hour.time.split(":")[0]}
                  </span>
                  <span className={styles.hourlyEmoji}>{hour.emoji}</span>
                  <span className={styles.hourlyTemp}>{hour.temperature}°</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
