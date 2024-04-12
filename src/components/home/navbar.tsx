"use client";
import { AlinoLogo, UserIcon } from "../../components/icons";
import { ButtonComponent } from "../../components/buttonComponent/buttonComponent";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <AlinoLogo height="35px" />
        <div className={styles.buttonsDiv}>
          <ButtonComponent
            name="iniciar sesión"
            back="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="login"
            strokeB={false}
          >
            <UserIcon
              style={{
                strokeWidth: "1.5",
                stroke: "#1c1c1c",
                width: "20px",
                height: "auto",
              }}
            />
          </ButtonComponent>
          {/* <ButtonComponent
            name="sobre alino"
            back="transparent"
            hover="rgb(240, 240, 240)"
            letterColor="#000"
            to="/"
            strokeB={false}
          ></ButtonComponent> */}
        </div>
      </nav>
    </div>
  );
}
