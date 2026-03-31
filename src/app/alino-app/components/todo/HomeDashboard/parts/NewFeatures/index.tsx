"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

import { useDashboardStore } from "@/store/useDashboardStore";

import styles from "./NewFeatures.module.css";
import { LoadingIcon } from "@/components/ui/icons/icons";
import { WindowModal } from "@/components/ui/WindowModal";

export const NewFeature = () => {
  const app_updates = useDashboardStore((state) => state.app_updates);
  const hasFetchedAppUpdates = useDashboardStore(
    (state) => state.hasFetchedAppUpdates,
  );
  const fetchAppUpdates = useDashboardStore((state) => state.fetchAppUpdates);

  useEffect(() => {
    if (!hasFetchedAppUpdates) {
      fetchAppUpdates();
    }
  }, [hasFetchedAppUpdates, fetchAppUpdates]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const init = hasFetchedAppUpdates;
  const validUpdates = app_updates || [];

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (validUpdates.length > 1 && !isTransitioning && !modal) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validUpdates.length);
      }, 20000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [validUpdates.length, isTransitioning, modal]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (validUpdates.length > 1 && !modal) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validUpdates.length);
      }, 20000);
    }
  }, [validUpdates.length, modal]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentIndex || isTransitioning) return;

      setIsTransitioning(true);
      setCurrentIndex(index);
      resetInterval();

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    },
    [currentIndex, isTransitioning, resetInterval],
  );

  const handleDotClick = (index: number) => {
    goToSlide(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleSwipe();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (validUpdates.length <= 1 || isTransitioning) return;

    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    if (swipeDistance > 0) {
      const nextIndex = (currentIndex + 1) % validUpdates.length;
      goToSlide(nextIndex);
    } else {
      const prevIndex =
        currentIndex === 0 ? validUpdates.length - 1 : currentIndex - 1;
      goToSlide(prevIndex);
    }
  };

  const currentUpdate = validUpdates[currentIndex];

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const handleCloseModal = () => {
    setModal(false);
  };

  const handleOpenModal = () => {
    setModal(true);
  };

  if (!init && validUpdates.length === 0) {
    return (
      <div className={styles.newFeatures}>
        <div className={styles.loadingContainer}>
          <LoadingIcon
            style={{
              width: "20px",
              height: "auto",
              stroke: "var(--text-not-available)",
              strokeWidth: "3",
            }}
          />
          <p>Cargando novedades...</p>
        </div>
      </div>
    );
  }

  if (init && validUpdates.length === 0) {
    return (
      <div className={styles.newFeatures}>
        <div className={styles.loadingContainer}>
          <p>No hay novedades disponibles</p>
        </div>
      </div>
    );
  }

  if (!currentUpdate) {
    return (
      <div className={styles.newFeatures}>
        <div className={styles.loadingContainer}>
          <p>No hay novedades disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newFeatures}>
      {modal && (
        <WindowModal closeAction={handleCloseModal} crossButton={false}>
          <div className={styles.modal}>
            {currentUpdate.image_url && (
              <Image
                src={currentUpdate.image_url}
                alt={currentUpdate.title || "New feature highlight"}
                className={styles.newFeaturesImage}
                width={1000}
                height={563}
                draggable={false}
                style={{ zIndex: 0, width: "100%" }}
              />
            )}
            <div className={styles.modalContent}>
              {!currentUpdate.image_url && (
                <div
                  className={styles.textHeader}
                  style={{ marginBottom: "10px" }}
                >
                  <span className={styles.categoryBadge}>
                    {currentUpdate.category || "Update"}
                  </span>
                  {currentUpdate.version && (
                    <span className={styles.versionBadge}>
                      v{currentUpdate.version}
                    </span>
                  )}
                </div>
              )}
              <h3 className={styles.modalTitle}>{currentUpdate.title}</h3>
              <p className={styles.modalText}>{currentUpdate.content}</p>
              <footer className={styles.footer}>
                <button onClick={handleCloseModal}>cerrar</button>
              </footer>
            </div>
          </div>
        </WindowModal>
      )}
      <div
        ref={containerRef}
        className={`${styles.contentContainer} ${isTransitioning ? styles.transitioning : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentUpdate.image_url ? (
          <Image
            src={currentUpdate.image_url}
            alt={currentUpdate.title || "New feature highlight"}
            className={styles.newFeaturesImage}
            width={1000}
            height={563}
            draggable={false}
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
              {truncateText(currentUpdate.content, 90)}
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

      {currentUpdate.published_at && (
        <p className={styles.date}>
          {currentUpdate.published_at &&
            new Date(currentUpdate.published_at)
              .toLocaleDateString("es-AR", {
                month: "short",
                year: "numeric",
              })
              .toUpperCase()}
        </p>
      )}

      <button className={styles.showMore} onClick={handleOpenModal}>
        ver más
      </button>
    </div>
  );
};
