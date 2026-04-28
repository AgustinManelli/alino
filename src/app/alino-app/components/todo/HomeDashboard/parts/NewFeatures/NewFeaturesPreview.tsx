"use client";

import { ArrowLeft } from "@/components/ui/icons/icons";
import styles from "./NewFeatures.module.css";

export const NewFeaturesPreview = () => {
  const mockUpdates = [
    {
      title: "Nueva función disponible",
      content: "Descubre las nuevas características que hemos añadido a tu dashboard.",
      category: "Novedad",
      version: "2.1.0"
    },
    {
      title: "Mejoras de rendimiento",
      content: "Hemos optimizado la carga de los widgets para una experiencia más fluida.",
      category: "Mejora",
      version: "2.0.5"
    }
  ];

  return (
    <div className={styles.newFeatures}>
      <div className={styles.updatesWrapper}>
        <div className={styles.updateItem}>
          <h3 className={styles.title}>
            {mockUpdates[0].title}
          </h3>
          <p className={styles.content}>
            {mockUpdates[0].content}
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.pagination}>
          {mockUpdates.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.dot} ${idx === 0 ? styles.dotActive : ""}`}
            />
          ))}
        </div>

        <div className={styles.navButtons}>
          <div className={styles.navBtn}>
            <ArrowLeft style={{ width: "14px", strokeWidth: 3 }} />
          </div>
          <div
            className={styles.navBtn}
            style={{ transform: "rotate(180deg)" }}
          >
            <ArrowLeft style={{ width: "14px", strokeWidth: 3 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
