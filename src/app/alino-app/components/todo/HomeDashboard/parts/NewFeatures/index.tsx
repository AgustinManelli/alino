"use client";

import styles from "./NewFeatures.module.css";

export const NewFeature = () => {
  return (
    <div className={styles.newFeatures}>
      <div className={styles.featureIcon}>✨</div>
      <div className={styles.featureContent}>
        <h4 className={styles.featureTitle}>Arrastrar y soltar</h4>
        <p className={styles.featureDescription}>
          Ahora puedes reorganizar tu dashboard como quieras
        </p>
      </div>
    </div>
  );
};
