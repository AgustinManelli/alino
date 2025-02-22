"use client";

import styles from "./navbar.module.css";
interface props {
  type: string;
  setType: (value: string) => void;
}
export default function NavbarConfig({ type, setType }: props) {
  return (
    <section className={styles.navbar}>
      <button
        className={styles.option}
        onClick={() => {
          setType("app");
        }}
        style={{
          backgroundColor:
            type === "app"
              ? "var(--background-over-container)"
              : "var(--background-container)",
        }}
      >
        <p className={styles.optionText}>aplicación</p>
      </button>
      <button
        className={styles.option}
        onClick={() => {
          setType("account");
        }}
        style={{
          backgroundColor:
            type === "account"
              ? "var(--background-over-container)"
              : "var(--background-container)",
        }}
      >
        <p className={styles.optionText}>cuenta</p>
      </button>
    </section>
  );
}
