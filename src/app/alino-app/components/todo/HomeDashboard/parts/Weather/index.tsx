// "use client";

// import React, { useEffect, useState } from "react";
// import styles from "./Weather.module.css";

// type WeatherState = {
//   temperature: number | null;
//   tempMin: number | null;
//   tempMax: number | null;
//   description: string | null;
//   emoji: string | null;
//   location: string | null;
//   loading: boolean;
//   error: string | null;
//   weatherType:
//     | "sunny"
//     | "cloudy"
//     | "rainy"
//     | "stormy"
//     | "snowy"
//     | "foggy"
//     | "night"
//     | "default";
// };

// const validTypes: WeatherState["weatherType"][] = [
//   "sunny",
//   "cloudy",
//   "rainy",
//   "stormy",
//   "snowy",
//   "foggy",
//   "night",
//   "default",
// ];

// const DEFAULT_LAT = -31.4167;
// const DEFAULT_LON = -64.1833;

// function mapWeatherCodeToSimple(code: number, isDay: boolean) {
//   let weatherType: WeatherState["weatherType"] = "default";

//   if (code === 0) {
//     weatherType = isDay ? "sunny" : "night";
//     return {
//       desc: isDay ? "Despejado" : "Despejado",
//       emoji: isDay ? "☀️" : "🌙",
//       weatherType,
//     };
//   }
//   if (code >= 1 && code <= 3) {
//     weatherType = "cloudy";
//     return {
//       desc: "Parcialmente nublado",
//       emoji: isDay ? "⛅" : "☁️",
//       weatherType,
//     };
//   }
//   if (code === 45 || code === 48) {
//     weatherType = "foggy";
//     return {
//       desc: "Niebla",
//       emoji: "🌫️",
//       weatherType,
//     };
//   }
//   if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) {
//     weatherType = "rainy";
//     return {
//       desc: "Llovizna / Chubascos",
//       emoji: isDay ? "🌦️" : "🌧️",
//       weatherType,
//     };
//   }
//   if ((code >= 61 && code <= 67) || code === 95) {
//     weatherType = "rainy";
//     return {
//       desc: "Lluvia",
//       emoji: "🌧️",
//       weatherType,
//     };
//   }
//   if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
//     weatherType = "snowy";
//     return {
//       desc: "Nieve",
//       emoji: "🌨️",
//       weatherType,
//     };
//   }
//   if (code >= 96 && code <= 99) {
//     weatherType = "stormy";
//     return {
//       desc: "Tormenta",
//       emoji: "⛈️",
//       weatherType,
//     };
//   }
//   return {
//     desc: "Condición desconocida",
//     emoji: "❓",
//     weatherType: "default",
//   };
// }

// export const Weather: React.FC<{ label?: string }> = ({ label }) => {
//   const [state, setState] = useState<WeatherState>({
//     temperature: null,
//     tempMin: null,
//     tempMax: null,
//     description: null,
//     emoji: null,
//     location: null,
//     loading: true,
//     error: null,
//     weatherType: "default",
//   });

//   useEffect(() => {
//     let mounted = true;

//     const fetchWeather = async (lat: number, lon: number) => {
//       try {
//         // Añadimos daily para obtener temp min/max
//         const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         const cw = data?.current_weather;
//         if (!cw) throw new Error("No hay datos de clima actual");

//         const temp =
//           typeof cw.temperature === "number"
//             ? Math.round(cw.temperature)
//             : null;
//         const code = typeof cw.weathercode === "number" ? cw.weathercode : -1;
//         const currentTimeStr = cw.time;
//         let isDay = true;

//         // Obtener temp min/max del día actual
//         let tempMin: number | null = null;
//         let tempMax: number | null = null;

//         try {
//           const daily = data?.daily;
//           const dailyTimes: string[] | undefined = daily?.time;
//           const sunrises: string[] | undefined = daily?.sunrise;
//           const sunsets: string[] | undefined = daily?.sunset;
//           const tempMaxArray: number[] | undefined = daily?.temperature_2m_max;
//           const tempMinArray: number[] | undefined = daily?.temperature_2m_min;

//           if (dailyTimes && Array.isArray(dailyTimes)) {
//             const currentDate = currentTimeStr.split("T")[0]; // "YYYY-MM-DD"
//             const dayIndex = dailyTimes.findIndex(
//               (t: string) => t === currentDate
//             );

//             if (dayIndex >= 0) {
//               // Obtener temp min/max
//               if (tempMaxArray && tempMaxArray[dayIndex] !== undefined) {
//                 tempMax = Math.round(tempMaxArray[dayIndex]);
//               }
//               if (tempMinArray && tempMinArray[dayIndex] !== undefined) {
//                 tempMin = Math.round(tempMinArray[dayIndex]);
//               }

//               // Calcular si es día o noche
//               if (sunrises && sunsets) {
//                 const sunriseStr = sunrises[dayIndex];
//                 const sunsetStr = sunsets[dayIndex];

//                 if (sunriseStr && sunsetStr) {
//                   const currentDateTime = new Date(currentTimeStr);
//                   const sunriseDate = new Date(sunriseStr);
//                   const sunsetDate = new Date(sunsetStr);

//                   isDay =
//                     currentDateTime >= sunriseDate &&
//                     currentDateTime < sunsetDate;
//                 }
//               }
//             }
//           }

//           // Fallback para día/noche si no hay datos de sunrise/sunset
//           if (
//             tempMin === null ||
//             tempMax === null ||
//             (dailyTimes && !dailyTimes.length)
//           ) {
//             const now = new Date(currentTimeStr);
//             const hour = now.getHours();
//             isDay = hour >= 6 && hour < 20;
//           }
//         } catch {
//           const now = new Date();
//           const hour = now.getHours();
//           isDay = hour >= 6 && hour < 20;
//         }

//         // const mapped = mapWeatherCodeToSimple(code, isDay);
//         const mapped = mapWeatherCodeToSimple(97, true);

//         return {
//           temperature: temp,
//           tempMin,
//           tempMax,
//           description: mapped.desc,
//           emoji: mapped.emoji,
//           weatherType: mapped.weatherType,
//           error: null as string | null,
//         };
//       } catch (err: any) {
//         return {
//           temperature: null,
//           tempMin: null,
//           tempMax: null,
//           description: null,
//           emoji: null,
//           weatherType: "default" as const,
//           error: err?.message ?? "Error al obtener clima",
//         };
//       }
//     };

//     const reverseGeocode = async (lat: number, lon: number) => {
//       try {
//         const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=es`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Geo HTTP ${res.status}`);
//         const data = await res.json();
//         const first = data?.results?.[0];
//         if (!first) throw new Error("Sin resultados de geocoding");
//         const parts = [first.name, first.admin1, first.country].filter(Boolean);
//         return parts.join(", ");
//       } catch {
//         return null;
//       }
//     };

//     const fetchCoordsByIP = async (): Promise<{
//       lat: number;
//       lon: number;
//       city?: string | null;
//       region?: string | null;
//       country?: string | null;
//     } | null> => {
//       try {
//         const res = await fetch("https://ipapi.co/json/");
//         if (!res.ok) return null;
//         const data = await res.json();
//         const lat = Number(data.latitude ?? data.lat);
//         const lon = Number(data.longitude ?? data.lon);
//         const city = data.city ?? null;
//         const region = data.region ?? data.region_name ?? null;
//         const country = data.country_name ?? null;
//         if (Number.isFinite(lat) && Number.isFinite(lon))
//           return { lat, lon, city, region, country };
//         return null;
//       } catch {
//         return null;
//       }
//     };

//     const tryGeolocationThenFetch = async () => {
//       let coords: { lat: number; lon: number } | null = null;
//       let ipInfo: {
//         city?: string | null;
//         region?: string | null;
//         country?: string | null;
//       } | null = null;

//       const ipCoords = await fetchCoordsByIP();
//       if (ipCoords) {
//         coords = { lat: ipCoords.lat, lon: ipCoords.lon };
//         ipInfo = {
//           city: ipCoords.city,
//           region: ipCoords.region,
//           country: ipCoords.country,
//         };
//       } else {
//         coords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
//       }

//       if (!coords) {
//         coords = { lat: DEFAULT_LAT, lon: DEFAULT_LON };
//       }

//       const [w, geoName] = await Promise.all([
//         fetchWeather(coords.lat, coords.lon),
//         (async () => {
//           if (ipInfo?.city) {
//             const parts = [ipInfo.city, ipInfo.region, ipInfo.country].filter(
//               Boolean
//             );
//             return parts.join(", ");
//           }
//           const g = await reverseGeocode(coords.lat, coords.lon);
//           return g;
//         })(),
//       ]);

//       if (!mounted) return;

//       setState({
//         temperature: w.temperature,
//         tempMin: w.tempMin,
//         tempMax: w.tempMax,
//         description: w.description,
//         emoji: w.emoji,
//         weatherType: validTypes.includes(
//           w.weatherType as WeatherState["weatherType"]
//         )
//           ? (w.weatherType as WeatherState["weatherType"])
//           : "default",
//         location:
//           label ??
//           geoName ??
//           (coords.lat === DEFAULT_LAT && coords.lon === DEFAULT_LON
//             ? "Córdoba, Argentina"
//             : null),
//         loading: false,
//         error: w.error,
//       });
//     };

//     tryGeolocationThenFetch();

//     return () => {
//       mounted = false;
//     };
//   }, [label]);

//   return (
//     <div className={`${styles.weatherWidget} ${styles[state.weatherType]}`}>
//       {state.loading ? (
//         <div className={styles.loadingContainer}>
//           <div className={styles.loadingSpinner}></div>
//           <span className={styles.loadingText}>Cargando clima…</span>
//         </div>
//       ) : state.error ? (
//         <div className={styles.errorContainer}>
//           <span className={styles.errorIcon}>⚠️</span>
//           <span className={styles.errorText}>Error al cargar clima</span>
//         </div>
//       ) : (
//         <div className={styles.weatherContainer}>
//           <div className={styles.locationHeader}>
//             {state.location ?? "Ubicación desconocida"}
//           </div>

//           <div className={styles.mainWeather}>
//             <div className={styles.leftSection}>
//               <div className={styles.currentTemp}>
//                 {state.temperature !== null ? `${state.temperature}°` : "—"}
//               </div>
//               <div className={styles.weatherDescription}>
//                 {state.description ?? "—"}
//               </div>
//             </div>

//             <div className={styles.rightSection}>
//               <div className={styles.weatherIcon}>{state.emoji}</div>
//             </div>
//           </div>

//           {(state.tempMin !== null || state.tempMax !== null) && (
//             <div className={styles.tempRange}>
//               <div className={styles.tempItem}>
//                 <span className={styles.tempLabel}>Mín</span>
//                 <span className={styles.tempValue}>
//                   {state.tempMin !== null ? `${state.tempMin}°` : "—"}
//                 </span>
//               </div>
//               <div className={styles.tempDivider}></div>
//               <div className={styles.tempItem}>
//                 <span className={styles.tempLabel}>Máx</span>
//                 <span className={styles.tempValue}>
//                   {state.tempMax !== null ? `${state.tempMax}°` : "—"}
//                 </span>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Weather;

"use client";

import React, { useEffect, useState } from "react";
import styles from "./Weather.module.css";

type WeatherState = {
  temperature: number | null;
  tempMin: number | null;
  tempMax: number | null;
  description: string | null;
  emoji: string | null;
  location: string | null;
  loading: boolean;
  error: string | null;
  weatherType:
    | "sunny"
    | "cloudy"
    | "rainy"
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
  emoji: string;
  isDay: boolean;
};

const validTypes: WeatherState["weatherType"][] = [
  "sunny",
  "cloudy",
  "rainy",
  "stormy",
  "snowy",
  "foggy",
  "night",
  "default",
];

const DEFAULT_LAT = -31.4167;
const DEFAULT_LON = -64.1833;

function mapWeatherCodeToSimple(code: number, isDay: boolean) {
  let weatherType: WeatherState["weatherType"] = "default";

  if (code === 0) {
    weatherType = isDay ? "sunny" : "night";
    return {
      desc: isDay ? "Despejado" : "Despejado",
      emoji: isDay ? "☀️" : "🌙",
      weatherType,
    };
  }
  if (code >= 1 && code <= 3) {
    weatherType = "cloudy";
    return {
      desc: "Parcialmente nublado",
      emoji: isDay ? "⛅" : "☁️",
      weatherType,
    };
  }
  if (code === 45 || code === 48) {
    weatherType = "foggy";
    return {
      desc: "Niebla",
      emoji: "🌫️",
      weatherType,
    };
  }
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) {
    weatherType = "rainy";
    return {
      desc: "Llovizna / Chubascos",
      emoji: isDay ? "🌦️" : "🌧️",
      weatherType,
    };
  }
  if ((code >= 61 && code <= 67) || code === 95) {
    weatherType = "rainy";
    return {
      desc: "Lluvia",
      emoji: "🌧️",
      weatherType,
    };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    weatherType = "snowy";
    return {
      desc: "Nieve",
      emoji: "🌨️",
      weatherType,
    };
  }
  if (code >= 96 && code <= 99) {
    weatherType = "stormy";
    return {
      desc: "Tormenta",
      emoji: "⛈️",
      weatherType,
    };
  }
  return {
    desc: "Condición desconocida",
    emoji: "❓",
    weatherType: "default",
  };
}

function getHourlyEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code >= 1 && code <= 3) return isDay ? "⛅" : "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if ((code >= 51 && code <= 57) || (code >= 80 && code <= 82)) return "🌦️";
  if ((code >= 61 && code <= 67) || code === 95) return "🌧️";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "🌨️";
  if (code >= 96 && code <= 99) return "⛈️";
  return "❓";
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
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1`;
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
              if (hourTime > currentTime && count < 6) {
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
          <div className={styles.loadingSpinner}></div>
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
                <span className={styles.locationIcon}>📍</span>
              </div>
              {/* Temperatura principal y descripción */}
              <div className={styles.mainWeather}>
                <div className={styles.primaryInfo}>
                  <div className={styles.temperatureSection}>
                    <span className={styles.currentTemp}>
                      {state.temperature !== null
                        ? `${state.temperature}°`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.desctempContainer}>
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
              <div className={styles.hourlyGrid}>
                {state.hourlyForecast.slice(0, 6).map((hour, index) => (
                  <div key={index} className={styles.hourlyItem}>
                    <span className={styles.hourlyTime}>{hour.time}</span>
                    <span className={styles.hourlyEmoji}>{hour.emoji}</span>
                    <span className={styles.hourlyTemp}>
                      {hour.temperature}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
