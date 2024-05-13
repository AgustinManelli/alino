import styles from "./footer.module.css";
import logo from "../../../public/alinologo.webp";

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <img src={logo.src} className={styles.img} />
        <section>footer content section</section>
      </div>
    </div>
  );
}
