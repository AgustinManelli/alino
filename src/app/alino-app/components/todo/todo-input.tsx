"use client";
import styles from "./todo-input.module.css";

export default function TodoInput() {
  return (
    <section className={styles.container}>
      <input
        className={styles.input}
        type="text"
        placeholder="ingrese una tarea"
      ></input>
      {/* <button className={styles.button}>send</button> */}
    </section>
  );
}
