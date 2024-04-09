"use client";
import ButtonComponent from "../../components/buttonComponent/buttonComponent";
import styles from "./header.module.css";

export default function Header() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.blurredFx}></div>
        <section className={styles.heroLeft}>
          <div className={styles.textSloganHeader}>
            <p>It's</p>
            <section className={styles.animation}>
              <div className={styles.first}>
                <div>all in one</div>
              </div>
              <div className={styles.second}>
                <div>all in order</div>
              </div>
              <div className={styles.third}>
                <div>alino</div>
              </div>
            </section>
          </div>
          <p className={styles.paraph}>
            Organizá tus clases, tareas y horarios en un mismo lugar. Es 100%
            gratis.
          </p>
          <ButtonComponent
            name="Pruebalo ya mismo"
            back="#87189d"
            hover="#6a0d7d"
            letterColor="#fff"
            to="login"
            strokeB={true}
          />
        </section>
      </header>
    </div>
  );
}
