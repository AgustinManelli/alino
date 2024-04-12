"use client";
import { ButtonComponent } from "../../components/buttonComponent/buttonComponent";
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
              <div>all in one</div>
              <div>all in order</div>
              <div>alino</div>
            </section>
          </div>
          <p className={styles.paraph}>
            Organizá tus clases, tareas y horarios en un mismo lugar. Es 100%
            gratis.
          </p>
          <ButtonComponent
            name="Pruébalo ya mismo"
            back="#87189d"
            hover="#6a0d7d"
            letterColor="#fff"
            to="login"
            strokeB={false}
          />
        </section>
      </header>
    </div>
  );
}
