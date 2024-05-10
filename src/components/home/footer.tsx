import styles from "./footer.module.css";

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <p style={{ color: "#fff" }}>footer</p>
      </div>
    </div>
  );
}
