"use client";

import styles from "./AppInformation.module.css";

export function AppInformation() {
  return (
    <div className={styles.container}>
      <section className={styles.containerSection}>
        <div className={`${styles.card} ${styles.cn1}`}>
          <div className={styles.textContainer}>
            <p>Rápida, simple y</p>
            <span>efectiva</span>
          </div>
        </div>
        <div className={`${styles.card} ${styles.cn2}`}> sadsa </div>
        <div className={`${styles.card} ${styles.cn3}`}> sadsads </div>
        <div className={`${styles.card} ${styles.cn4}`}>sadsad</div>
        <div className={`${styles.card} ${styles.cn5}`}> sadsadsa </div>
        <div className={`${styles.card} ${styles.cn6}`}> sadsadsa </div>
      </section>
    </div>
  );
}
