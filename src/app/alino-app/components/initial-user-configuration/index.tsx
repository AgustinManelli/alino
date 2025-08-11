"use client";

import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { WindowComponent } from "@/components/ui/window-component";
import styles from "./InitialUserConfiguration.module.css";
import UsernameInput from "./username-input";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEffect, useRef } from "react";

export default function InitialUserConfiguration() {
  const { user, getUser } = useTodoDataStore();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchUser = async () => {
      await getUser();
    };

    fetchUser();
  }, []);

  return (
    <>
      <WindowComponent
        windowTitle={"Bienvenido a Alino"}
        closeAction={false}
        adaptative={true}
        id={"initial-user-configuration-popup"}
      >
        <div className={styles.container}>
          <section className={styles.textsContainer}>
            <p className={styles.subtitle}>
              Una forma bonita y práctica de organizar tu día.{" "}
              <span>
                <EmojiMartComponent shortcodes={":heart_eyes:"} size={"18px"} />
              </span>
            </p>
            <p className={styles.subtitle}>
              Antes de comenzar, necesitarás definir el nombre con el que el
              mundo te conocerá. Bueno... o al menos los otros usuarios de
              Alino.
            </p>
            <p className={styles.subtitle}>
              Ya hemos pensado uno para ti, pero sé que tienes en mente uno
              mejor. ¿O no?
            </p>
          </section>
          {/* <div className={styles.username}>{user?.username}</div> */}
          <UsernameInput initialValue={user?.username} />
        </div>
      </WindowComponent>
    </>
  );
}
