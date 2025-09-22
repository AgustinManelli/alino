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
  const [state, setState] = useState<WeatherState>({
    temperature: null,
    tempMin: null,
    tempMax: null,
    description: null,
    emoji: null,
    location: null,
    loading: true,
    error: null,
    weatherType: "default",
    hourlyForecast: [],
  });

  useEffect(() => {
    let mounted = true;

    const fetchWeatherAndHourly = async (lat: number, lon: number) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=2`;
        const res = await fetch(url);
        // const res = {
        //   latitude: -31.42,
        //   longitude: -64.18,
        //   generationtime_ms: 0.5,
        //   utc_offset_seconds: -10800,
        //   timezone: "America/Argentina/Cordoba",
        //   timezone_abbreviation: "-03",
        //   elevation: 427.0,

        //   current_weather: {
        //     temperature: 23.5,
        //     windspeed: 11.2,
        //     winddirection: 240,
        //     weathercode: 61,
        //     is_day: 1,
        //     time: "2025-09-21T23:00",
        //   },

        //   daily: {
        //     time: ["2025-09-21", "2025-09-22"],
        //     temperature_2m_max: [28.1, 29.5],
        //     temperature_2m_min: [18.3, 19.0],
        //     sunrise: ["2025-09-21T06:45", "2025-09-22T06:44"],
        //     sunset: ["2025-09-21T19:08", "2025-09-22T19:09"],
        //   },

        //   hourly: {
        //     time: [
        //       "2025-09-21T20:00",
        //       "2025-09-21T21:00",
        //       "2025-09-21T22:00",
        //       "2025-09-21T23:00",
        //       "2025-09-22T00:00",
        //       "2025-09-22T01:00",
        //       "2025-09-22T02:00",
        //       "2025-09-22T03:00",
        //       "2025-09-22T04:00",
        //     ],
        //     temperature_2m: [
        //       26.0, 24.5, 22.1, 21.5, 20.8, 20.0, 19.5, 19.0, 18.5,
        //     ],
        //     weathercode: [
        //       3,
        //       3,
        //       0,
        //       0,
        //       0,
        //       3,
        //       61,
        //       61,
        //       95,
        //     ],
        //   },
        // };
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // const data = res;
        const cw = data?.current_weather;
        if (!cw) throw new Error("No hay datos de clima actual");

        const temp =
          typeof cw.temperature === "number"
            ? Math.round(cw.temperature)
            : null;
        const code = typeof cw.weathercode === "number" ? cw.weathercode : -1;
        const currentTimeStr = cw.time;
        let isDay = true;

        // Obtener temp min/max del día actual
        let tempMin: number | null = null;
        let tempMax: number | null = null;
        let hourlyForecast: HourlyData[] = [];

        try {
          const daily = data?.daily;
          const hourly = data?.hourly;
          const dailyTimes: string[] | undefined = daily?.time;
          const sunrises: string[] | undefined = daily?.sunrise;
          const sunsets: string[] | undefined = daily?.sunset;
          const tempMaxArray: number[] | undefined = daily?.temperature_2m_max;
          const tempMinArray: number[] | undefined = daily?.temperature_2m_min;

          if (dailyTimes && Array.isArray(dailyTimes)) {
            const currentDate = currentTimeStr.split("T")[0];
            const dayIndex = dailyTimes.findIndex(
              (t: string) => t === currentDate
            );

            if (dayIndex >= 0) {
              // Obtener temp min/max
              if (tempMaxArray && tempMaxArray[dayIndex] !== undefined) {
                tempMax = Math.round(tempMaxArray[dayIndex]);
              }
              if (tempMinArray && tempMinArray[dayIndex] !== undefined) {
                tempMin = Math.round(tempMinArray[dayIndex]);
              }

              // Calcular si es día o noche
              if (sunrises && sunsets) {
                const sunriseStr = sunrises[dayIndex];
                const sunsetStr = sunsets[dayIndex];

                if (sunriseStr && sunsetStr) {
                  const currentDateTime = new Date(currentTimeStr);
                  const sunriseDate = new Date(sunriseStr);
                  const sunsetDate = new Date(sunsetStr);

                  isDay =
                    currentDateTime >= sunriseDate &&
                    currentDateTime < sunsetDate;
                  // isDay = true;
                }
              }
            }
          }

          // Procesar datos horarios para las próximas 6 horas
          if (
            hourly &&
            hourly.time &&
            hourly.temperature_2m &&
            hourly.weathercode
          ) {
            const currentTime = new Date(currentTimeStr);
            const hourlyTimes = hourly.time;
            const hourlyTemps = hourly.temperature_2m;
            const hourlyCodes = hourly.weathercode;

            let count = 0;
            for (let i = 0; i < hourlyTimes.length; i++) {
              const hourTime = new Date(hourlyTimes[i]);
              if (hourTime > currentTime && count < 7) {
                const hour = hourTime.getHours();
                const hourIsDay = hour >= 6 && hour < 20;

                hourlyForecast.push({
                  time: hourTime.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  temperature: Math.round(hourlyTemps[i]),
                  weatherCode: hourlyCodes[i],
                  emoji: getHourlyEmoji(hourlyCodes[i], hourIsDay),
                  isDay: hourIsDay,
                });
                count++;
              }
            }
          }

          // Fallback para día/noche si no hay datos de sunrise/sunset
          if (
            tempMin === null ||
            tempMax === null ||
            (dailyTimes && !dailyTimes.length)
          ) {
            const now = new Date(currentTimeStr);
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
          tempMin,
          tempMax,
          description: mapped.desc,
          emoji: mapped.emoji,
          weatherType: mapped.weatherType,
          hourlyForecast,
          error: null as string | null,
        };
      } catch (err: any) {
        return {
          temperature: null,
          tempMin: null,
          tempMax: null,
          description: null,
          emoji: null,
          weatherType: "default" as const,
          hourlyForecast: [],
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
        fetchWeatherAndHourly(coords.lat, coords.lon),
        (async () => {
          if (ipInfo?.city) {
            const parts = [ipInfo.city, ipInfo.region].filter(Boolean);
            return parts.join(", ");
          }
          const g = await reverseGeocode(coords.lat, coords.lon);
          return g;
        })(),
      ]);

      if (!mounted) return;

      setState({
        temperature: w.temperature,
        tempMin: w.tempMin,
        tempMax: w.tempMax,
        description: w.description,
        emoji: w.emoji,
        weatherType: validTypes.includes(
          w.weatherType as WeatherState["weatherType"]
        )
          ? (w.weatherType as WeatherState["weatherType"])
          : "default",
        location:
          label ??
          geoName ??
          (coords.lat === DEFAULT_LAT && coords.lon === DEFAULT_LON
            ? "Córdoba, Argentina"
            : null),
        loading: false,
        error: w.error,
        hourlyForecast: w.hourlyForecast,
      });
    };

    tryGeolocationThenFetch();

    return () => {
      mounted = false;
    };
  }, [label]);

  return (
    <div className={`${styles.weatherWidget} ${styles[state.weatherType]}`}>
      {state.loading ? (
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
      ) : state.error ? (
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>Error al cargar clima</span>
        </div>
      ) : (
        <div className={styles.weatherContainer}>
          {/* Header con ubicación */}
          <div className={styles.headerWidget}>
            <div className={styles.loctempContainer}>
              <div className={styles.locationHeader}>
                <span className={styles.locationText}>
                  {state.location ?? "Ubicación desconocida"}
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
              {/* Temperatura principal y descripción */}
              <span className={styles.currentTemp}>
                {state.temperature !== null ? `${state.temperature}°` : "—"}
              </span>
            </div>
            <div className={styles.desctempContainer}>
              {state.emoji}
              <div className={styles.weatherDescription}>
                {state.description ?? "—"}
              </div>
              <p>
                Máx.: {state.tempMax !== null ? `${state.tempMax}°` : "—"} Mín.:{" "}
                {state.tempMin !== null ? `${state.tempMin}°` : "—"}
              </p>
            </div>
          </div>

          {/* Pronóstico horario */}
          {state.hourlyForecast.length > 0 && (
            <div className={styles.hourlyForecast}>
              {state.hourlyForecast.slice(0, 7).map((hour, index) => (
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
