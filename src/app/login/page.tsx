"use client";
import styles from "./login.module.css";
import { AlinoLogo, ArrowLeft } from "../components/icons";
import Link from "next/link";
export default function Login() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Link href="/">
          <div className={styles.backButton}>
            <ArrowLeft />
          </div>
        </Link>
        <AlinoLogo height="50px" />
        <section className={styles.form}>
          <div>
            <h2 className={styles.title}>Iniciar sesion</h2>
            <p className={styles.paraph}>Si no tienes cuenta, crea una</p>
          </div>
          <form className={styles.inputs}>
            <div className={styles.inputContainer}>
              <input type="text" placeholder="email" className={styles.input} />
            </div>
            <div className={styles.inputContainer}>
              <input
                type="password"
                placeholder="password"
                className={styles.input}
              />
            </div>
            <button className={styles.buttom}>Iniciar sesion</button>
          </form>
          <div className={styles.moreInfo}>
            <p>¿Olvidaste tu constraseña?</p>
            <p>¿No tienes una cuenta?</p>
          </div>
        </section>
      </main>
    </div>
  );
}
