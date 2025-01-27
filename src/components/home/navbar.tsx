"use client";

import { AlinoLogo, UserIcon, Crown } from "../../lib/ui/icons";
import { ButtonLink } from "@/components/button-link";
import styles from "./navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <AlinoLogo style={{ height: "35px" }} />
        <div className={styles.buttonsDiv}>
          <ButtonLink
            text=""
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="404"
            strokeBorder={false}
            withLoader={true}
            style={{ pointerEvents: "none", opacity: "0.4" }}
          >
            <Crown
              style={{
                strokeWidth: "1.5",
                stroke: "#87189d",
                width: "20px",
                height: "auto",
              }}
            />
          </ButtonLink>
          <ButtonLink
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
          </ButtonLink>
        </div>
      </nav>
    </div>
  );
}
