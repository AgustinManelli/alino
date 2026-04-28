"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useFetchAppUpdates } from "@/hooks/dashboard/useFetchAppUpdates";
import { WindowModal } from "@/components/ui/WindowModal";
import { ArrowLeft, LoadingIcon } from "@/components/ui/icons/icons";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";

import { NewFeaturesPreview } from "./NewFeaturesPreview";
import styles from "./NewFeatures.module.css";

const AUTO_PLAY_INTERVAL = 10000;

const CATEGORY_MAP: Record<string, string> = {
  new_feature: "Novedad",
  improvement: "Mejora",
  bug_fix: "Corrección",
  announcement: "Anuncio",
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export const NewFeature = () => {
  const app_updates = useDashboardStore((state) => state.app_updates);
  const hasFetchedAppUpdates = useDashboardStore(
    (state) => state.hasFetchedAppUpdates,
  );
  const { fetchAppUpdates } = useFetchAppUpdates();
  const isPreview = useWidgetPreview();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (!hasFetchedAppUpdates) {
      fetchAppUpdates();
    }
  }, [hasFetchedAppUpdates, fetchAppUpdates]);

  if (isPreview) {
    return <NewFeaturesPreview />;
  }

  const validUpdates = useMemo(() => app_updates || [], [app_updates]);
  const currentUpdate = validUpdates[currentIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      const nextIndex =
        (currentIndex + newDirection + validUpdates.length) %
        validUpdates.length;
      setPage([page + newDirection, newDirection]);
      setCurrentIndex(nextIndex);
    },
    [currentIndex, page, validUpdates.length],
  );

  useEffect(() => {
    if (validUpdates.length <= 1 || modal) return;

    const timer = setInterval(() => {
      paginate(1);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [validUpdates.length, modal, paginate]);

  if (!hasFetchedAppUpdates && validUpdates.length === 0) {
    return (
      <div className={styles.newFeatures}>
        <div className={styles.loadingContainer}>
          <LoadingIcon style={{ width: "24px", opacity: 0.2 }} />
        </div>
      </div>
    );
  }

  if (hasFetchedAppUpdates && validUpdates.length === 0) {
    return (
      <div className={styles.newFeatures}>
        <div className={styles.loadingContainer}>
          <p>Sin novedades</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newFeatures}>
      {modal && currentUpdate && (
        <WindowModal closeAction={() => setModal(false)} crossButton={true}>
          <div className={styles.modal}>
            {currentUpdate.image_url && (
              <Image
                src={currentUpdate.image_url}
                alt={currentUpdate.title}
                className={styles.modalImage}
                width={800}
                height={450}
              />
            )}
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div className={styles.metaInfo}>
                  <span className={styles.category}>
                    {currentUpdate.category
                      ? CATEGORY_MAP[currentUpdate.category] ||
                        currentUpdate.category
                      : ""}
                  </span>
                  {currentUpdate.version && (
                    <span className={styles.version}>
                      v{currentUpdate.version}
                    </span>
                  )}
                </div>
                <h2 className={styles.modalTitle}>{currentUpdate.title}</h2>
              </div>
              <p className={styles.modalText}>{currentUpdate.content}</p>
              <footer className={styles.modalFooter}>
                <button onClick={() => setModal(false)}>cerrar</button>
              </footer>
            </div>
          </div>
        </WindowModal>
      )}

      <div className={styles.updatesWrapper}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag={validUpdates.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={(e, { offset, velocity }) => {
              if (validUpdates.length <= 1) return;
              if (offset.x < -50) {
                paginate(1);
              } else if (offset.x > 50) {
                paginate(-1);
              }
            }}
            className={styles.updateItem}
          >
            {/* <div className={styles.metaInfo}>
              <span className={styles.category}>
                {currentUpdate?.category
                  ? CATEGORY_MAP[currentUpdate.category] ||
                    currentUpdate.category
                  : ""}
              </span>
              {currentUpdate?.version && (
                <span className={styles.version}>v{currentUpdate.version}</span>
              )}
            </div> */}
            <h3 className={styles.title} onClick={() => setModal(true)}>
              {currentUpdate?.title}
            </h3>
            <p className={styles.content}>{currentUpdate?.content}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.footer}>
        <div
          className={styles.pagination}
          style={{ visibility: validUpdates.length > 1 ? "visible" : "hidden" }}
        >
          {validUpdates.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ""}`}
              onClick={() => {
                const dir = idx > currentIndex ? 1 : -1;
                setPage([page + dir, dir]);
                setCurrentIndex(idx);
              }}
            />
          ))}
        </div>

        {validUpdates.length > 1 && (
          <div className={styles.navButtons}>
            <button className={styles.navBtn} onClick={() => paginate(-1)}>
              <ArrowLeft style={{ width: "14px", strokeWidth: 3 }} />
            </button>
            <button
              className={styles.navBtn}
              onClick={() => paginate(1)}
              style={{ transform: "rotate(180deg)" }}
            >
              <ArrowLeft style={{ width: "14px", strokeWidth: 3 }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
