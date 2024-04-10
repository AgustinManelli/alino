"use client";
import { AlinoLogo } from "../../components/icons";
import ButtonComponent from "../../components/buttonComponent/buttonComponent";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <AlinoLogo height="35px" />
        <ButtonComponent
          name="Iniciar sesion"
          back="rgb(240, 240, 240)"
          hover="rgb(230, 230, 230)"
          letterColor="#000"
          to="alino-app"
          strokeB={false}
        />
      </nav>
    </div>
  );
}
