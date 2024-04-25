"use client";

import styles from "./form-container.module.css";
import { AlinoLogo, HomeIcon } from "../../lib/ui/icons";
import { ButtonComponent } from "@/components/buttonComponent/buttonComponent";

interface Props {
  children?: string | JSX.Element | JSX.Element[] | null;
}

export const FormContainer: React.FC<Props> = ({ children }) => {
  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <div className={styles.backButton}>
          <ButtonComponent
            background="rgb(240, 240, 240)"
            hover="rgb(230, 230, 230)"
            letterColor="#000"
            to="/"
            strokeBorder={false}
          >
            <HomeIcon
              style={{
                strokeWidth: "2",
                stroke: "#1c1c1c",
                width: "25px",
                height: "auto",
                fill: "none",
              }}
            />
          </ButtonComponent>
        </div>
        <AlinoLogo style={{ height: "50px" }} />
        <div className={styles.form}>{children}</div>
      </section>
    </main>
  );
};
