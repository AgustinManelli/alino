import styles from "./content.module.css";

export default function Content() {
  return (
    <div className={styles.contentContainer}>
      <div className={styles.maxWidthContainer}>
        <section className={styles.leftGrid}>
          <div className={styles.leftGridRow}></div>
          <div className={styles.leftGridRow}></div>
        </section>
        <section className={styles.rightGrid}></section>
      </div>
    </div>
  );
}
