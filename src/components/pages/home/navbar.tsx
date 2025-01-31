"use client";

import { AlinoLogo, UserIcon } from "../../ui/icons/icons";
import { ButtonLink } from "@/components/ui/button-link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <AlinoLogo style={{ height: "35px" }} />
        <div className={styles.buttonsDiv}>
          <ButtonLink
            text="iniciar sesión"
            background="rgba(240, 240, 240, 0.4)"
            hover="rgba(230, 230, 230, 0.4)"
            letterColor="#1c1c1c"
            to="sign-in"
            strokeBorder={false}
            withLoader={true}
          >
            <UserIcon
              style={{
                strokeWidth: "1.5",
                stroke: "#1c1c1c",
                width: "100%",
                height: "auto",
              }}
            />
          </ButtonLink>
        </div>
      </nav>
    </div>
  );
}
