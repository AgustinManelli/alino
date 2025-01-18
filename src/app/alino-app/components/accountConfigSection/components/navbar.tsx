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
          backgroundColor: type === "app" ? "rgb(245, 245, 245)" : "#fff",
          boxShadow:
            type === "app"
              ? "rgba(0, 0, 0, 0.1) 0px 1px 1px 0px, rgba(0, 0, 0, 0.05) 0px -1px 0px 0px inset, rgba(255, 255, 255, 0.05) 0px 1px 1px 0px inset, rgba(0, 0, 0, 0.03) 0px 1px 2px 0px"
              : "none",
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
          backgroundColor: type === "account" ? "rgb(245, 245, 245)" : "#fff",
          boxShadow:
            type === "account"
              ? "rgba(0, 0, 0, 0.1) 0px 1px 1px 0px, rgba(0, 0, 0, 0.05) 0px -1px 0px 0px inset, rgba(255, 255, 255, 0.05) 0px 1px 1px 0px inset, rgba(0, 0, 0, 0.03) 0px 1px 2px 0px"
              : "none",
        }}
      >
        <p className={styles.optionText}>cuenta</p>
      </button>
    </section>
  );
}
