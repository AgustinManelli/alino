"use client";

import { AlinoLogo, UserIcon } from "../../lib/ui/icons";
import { ButtonComponent } from "../../components/buttonComponent/buttonComponent";
import styles from "./navbar.module.css";
import { useLoaderStore } from "@/store/useLoaderStore";

export default function Navbar() {
  const setLoading = useLoaderStore((state) => state.setLoading);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <AlinoLogo style={{ height: "35px" }} />
        <div
          className={styles.buttonsDiv}
          onClick={() => {
            document.body.style.overflow = "hidden";
            setLoading(true);
          }}
        >
          <ButtonComponent
            text="iniciar sesión"
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="sign-in"
            strokeBorder={false}
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
        </div>
      </nav>
    </div>
  );
}
