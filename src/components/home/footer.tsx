"use client";

import styles from "./footer.module.css";

export default function Footer() {
  var year = new Date().getFullYear();
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}></div>
      <div className={styles.footerStripeContainer}>
        <div className={styles.footerStripe}>
          <p>
            <span>{year}</span> Alino.
          </p>
        </div>
      </div>
    </div>
  );
}
