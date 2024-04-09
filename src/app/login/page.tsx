"use client";
import styles from "./login.module.css";
import { AlinoLogo, ArrowLeft } from "../components/icons";
import Link from "next/link";
import { login, signup } from "./actions";
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
            <h2 className={styles.title}>Iniciar sesión</h2>
            <p className={styles.paraph}>Inicia sesión si tienes una cuenta</p>
          </div>
          <form className={styles.inputs}>
            <div className={styles.inputContainer}>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="email"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.inputContainer}>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                className={styles.input}
                required
              />
            </div>
            <button className={styles.buttom} formAction={login}>
              Iniciar sesion
            </button>
            <button className={styles.buttom} formAction={signup}>
              Crear
            </button>
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
