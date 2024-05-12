"use client";

import { ButtonComponent } from "../../components/buttonComponent/buttonComponent";
import styles from "./header.module.css";
import imgHero from "../../../public/headerAlino3D.webp";

export default function Header() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        {/* <div className={styles.blurredFx}></div> */}
        <section className={styles.heroLeft}>
          {/* <div className={styles.textSloganHeader}>
            <p>It's</p>
            <section className={styles.animation}>
              <div>all in one</div>
              <div>all in order</div>
              <div>alino</div>
            </section>
          </div> */}
          <div className={styles.ctaContainer}>
            <p className={styles.paraph}>
              Organizá tus clases, tareas, trabajos u horarios en un mismo
              lugar. <br />
              Es <span className={styles.paraphSpan}>100% gratis</span>.
            </p>
            <ButtonComponent
              text="Pruebalo ya mismo"
              background="#1c1c1c"
              hover="rgb(230, 230, 230)"
              letterColor="#fff"
              to="sign-in"
              strokeBorder={true}
            />
          </div>
          <img src={imgHero.src} className={styles.img} />
        </section>
      </header>
    </div>
  );
}
