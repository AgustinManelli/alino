"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useDashboardStore } from "@/store/useDashboardStore";

import styles from "./NewFeatures.module.css";
import { LoadingIcon } from "@/components/ui/icons/icons";

export const NewFeature = () => {
  const app_updates = useDashboardStore((state) => state.app_updates);

  const [init, setInit] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const initialized = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!initialized.current) {
        await useDashboardStore.getState().getAppUpdates();
        initialized.current = true;
        setInit(true);
      }
    };

    init();
  }, []);

  const validUpdates = app_updates || [];

  // Auto-advance carousel
  useEffect(() => {
    if (validUpdates.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validUpdates.length);
      }, 20000); // Cambia cada 4 segundos

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [validUpdates.length]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);

    // Reiniciar el timer cuando el usuario hace click manual
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validUpdates.length);
      }, 20000);
    }
  };

  if (!validUpdates.length) {
    return null;
  }

  const currentUpdate = validUpdates[currentIndex];

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className={styles.newFeatures}>
      {init ? (
        <>
          <div className={styles.contentContainer}>
            {currentUpdate.image_url ? (
              <Image
                src={currentUpdate.image_url}
                alt={currentUpdate.title || "New feature highlight"}
                className={styles.newFeaturesImage}
                width={1000}
                height={563}
              />
            ) : (
              <div className={styles.textContent}>
                <div className={styles.textHeader}>
                  <span className={styles.categoryBadge}>
                    {currentUpdate.category || "Update"}
                  </span>
                  {currentUpdate.version && (
                    <span className={styles.versionBadge}>
                      v{currentUpdate.version}
                    </span>
                  )}
                </div>
                <h3 className={styles.title}>
                  {truncateText(currentUpdate.title, 50)}
                </h3>
                <p className={styles.description}>
                  {truncateText(currentUpdate.content, 80)}
                </p>
              </div>
            )}
          </div>

          {validUpdates.length > 1 && (
            <div className={styles.dotsContainer}>
              {validUpdates.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${
                    index === currentIndex ? styles.dotActive : ""
                  }`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className={styles.loadingContainer}>
          <p>Cargando lo nuevo de alino</p>
          <LoadingIcon
            style={{
              width: "20px",
              height: "auto",
              stroke: "var(--text-not-available)",
              strokeWidth: "3",
            }}
          />
        </div>
      )}
    </div>
  );
};
