"use client";
import WindowComponent from "@/components/windowComponent";
import styles from "./accountConfigSection.module.css";
import { useState } from "react";

export default function AccountConfigSection({
  name,
  userAvatarUrl,
  handleCloseConfig,
}: {
  name: string;
  userAvatarUrl: string;
  handleCloseConfig: () => void;
}) {
  const [type, setType] = useState<string>("account");

  return (
    <WindowComponent
      windowName={"configuración"}
      crossAction={handleCloseConfig}
    >
      <div className={styles.body}>
        <section className={styles.navbar}>
          <button
            className={styles.option}
            onClick={() => {
              setType("account");
            }}
            style={{
              backgroundColor:
                type === "account" ? "rgb(245, 245, 245)" : "#fff",
              boxShadow:
                type === "account"
                  ? "rgba(12, 20, 66, 0.02) 0px 4px 12px, rgba(12, 20, 66, 0.08) 0px 30px 80px, rgb(230, 233, 237) 0px 0px 0px 0px inset;"
                  : "none",
            }}
          >
            <p className={styles.optionText}>cuenta</p>
          </button>
        </section>
        <div className={styles.separator}></div>
        {type === "account" ? (
          <section className={styles.section1}>
            <img className={styles.avatar} src={userAvatarUrl} />
            <p>{name}</p>
          </section>
        ) : (
          <section className={styles.section1}></section>
        )}
      </div>
    </WindowComponent>
  );
}
