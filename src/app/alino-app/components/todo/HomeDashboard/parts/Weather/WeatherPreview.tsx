"use client";

import React from "react";
import { Sunny, Navigation } from "@/components/ui/icons/weather-icons";
import styles from "./Weather.module.css";

const IconStyles = {
  stroke: "#ffffff",
  strokeWidth: 2,
  width: "18px",
  height: "18px",
} as React.CSSProperties;

export const WeatherPreview = () => {
  const displayWeather = {
    temperature: 24,
    tempMin: 18,
    tempMax: 27,
    description: "Despejado",
    emoji: <Sunny style={{ fill: "#ffffff", ...IconStyles }} />,
    location: "Córdoba, AR",
    weatherType: "sunny" as const,
    hourlyForecast: [
      { time: "14:00", temperature: 25, emoji: <Sunny style={IconStyles} /> },
      { time: "15:00", temperature: 26, emoji: <Sunny style={IconStyles} /> },
      { time: "16:00", temperature: 27, emoji: <Sunny style={IconStyles} /> },
    ]
  };

  return (
    <div className={`${styles.weatherWidget} ${styles[displayWeather.weatherType]}`}>
      <div className={styles.weatherContainer}>
        <div className={styles.headerWidget}>
          <div className={styles.loctempContainer}>
            <div className={styles.locationHeader}>
              <span className={styles.locationText}>
                {displayWeather.location}
              </span>
              <span className={styles.locationIcon}>
                <Navigation
                  style={{ width: "15px", height: "15px", fill: "#ffffff" }}
                />
              </span>
            </div>
            <span className={styles.currentTemp}>
              {displayWeather.temperature}°
            </span>
          </div>
          <div className={styles.desctempContainer}>
            {displayWeather.emoji}
            <div className={styles.weatherDescription}>
              {displayWeather.description}
            </div>
            <p>
              Máx.: {displayWeather.tempMax}° Mín.: {displayWeather.tempMin}°
            </p>
          </div>
        </div>

        <div className={styles.hourlyForecast}>
          {displayWeather.hourlyForecast.map((hour, index) => (
            <div key={index} className={styles.hourlyItem}>
              <span className={styles.hourlyTime}>
                {hour.time.split(":")[0]}
              </span>
              <span className={styles.hourlyEmoji}>{hour.emoji}</span>
              <span className={styles.hourlyTemp}>{hour.temperature}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
