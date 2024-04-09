"use client";
import { AlinoLogo } from "../../components/icons";
import ButtonComponent from "../../components/buttonComponent/buttonComponent";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <AlinoLogo height="35px" />
      <ButtonComponent
        name="Iniciar sesion"
        back="rgb(250, 250, 250)"
        hover="rgb(240, 240, 240)"
        letterColor="#000"
        to="login"
        strokeB={false}
      />
    </nav>
  );
}
