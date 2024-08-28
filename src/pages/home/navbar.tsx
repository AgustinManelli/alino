"use client";

import { AlinoLogo, UserIcon } from "../../lib/ui/icons";
import { ButtonComp } from "@/components";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <AlinoLogo style={{ height: "35px" }} />
        <div className={styles.buttonsDiv}>
          <ButtonComp
            text="iniciar sesión"
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="sign-in"
            strokeBorder={false}
            withLoader={true}
          >
            <UserIcon
              style={{
                strokeWidth: "1.5",
                stroke: "#1c1c1c",
                width: "20px",
                height: "auto",
              }}
            />
          </ButtonComp>
        </div>
      </nav>
    </div>
  );
}
