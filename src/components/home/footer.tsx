import styles from "./footer.module.css";
import logo from "../../../public/alinologo.webp";

export default function Footer() {
  var year = new Date().getFullYear();
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <img
          src={logo.src}
          className={styles.img}
          alt="alino-footer"
          loading="lazy"
        />
        {/*<section>footer content section</section>*/}
      </div>
      <div className={styles.footerStripeContainer}>
        <div className={styles.footerStripe}>
          <p>
            alino - <span>{year}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
