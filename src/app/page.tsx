"use client";
import styles from "./page.module.css";
import { AlinoLogo, AlinoTape } from "./components/icons";
import Link from "next/link";
import ButtonComponent from "./components/buttonComponent/buttonComponent";

export default function Home() {
  return (
    <main className={styles.main}>
      <nav className={styles.navbar}>
        <AlinoLogo height="35px" />
        {/* <Link href="/login">
          <p>iniciar sesion</p>
        </Link> */}
        <ButtonComponent
          name="Iniciar sesion"
          back="rgb(250, 250, 250)"
          letterColor="#000"
        />
      </nav>
      <header className={styles.hero}>
        {/* <AlinoTape /> */}
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
            Organizá tus clases, tareas y horarios en un mismo lugar.
          </p>
          <ButtonComponent
            name="Pruebalo ya mismo"
            back="#87189d"
            letterColor="#fff"
          />
        </section>
      </header>
    </main>
  );
}
