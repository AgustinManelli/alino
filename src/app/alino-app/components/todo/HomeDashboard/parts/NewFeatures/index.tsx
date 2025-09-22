"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

import { useDashboardStore } from "@/store/useDashboardStore";

import styles from "./NewFeatures.module.css";
import { LoadingIcon } from "@/components/ui/icons/icons";
import { ClientOnlyPortal } from "@/components/ui/ClientOnlyPortal";
import { WindowComponent } from "@/components/ui/window-component";
import { WindowModal } from "@/components/ui/WindowModal";

export const NewFeature = () => {
  const app_updates = useDashboardStore((state) => state.app_updates);

  const [init, setInit] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const initialized = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe functionality refs
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Auto-advance carousel - Updated to depend on modal state
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start interval if modal is closed, we have multiple updates, and not transitioning
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
  }, [validUpdates.length, isTransitioning, modal]); // Added modal to dependencies

  // Cleanup interval on unmount
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
    // Only restart if modal is closed
    if (validUpdates.length > 1 && !modal) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validUpdates.length);
      }, 20000);
    }
  }, [validUpdates.length, modal]); // Added modal dependency

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
    [currentIndex, isTransitioning, resetInterval]
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

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const handleCloseModal = () => {
    setModal(false);
    // The useEffect will automatically restart the interval when modal becomes false
  };

  const handleOpenModal = () => {
    setModal(true);
    // The useEffect will automatically stop the interval when modal becomes true
  };

  return (
    <div className={styles.newFeatures}>
      {init ? (
        <>
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
        </>
      ) : (
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
      )}
    </div>
  );
};
