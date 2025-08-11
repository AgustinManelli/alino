"use client";

import { WindowComponent } from "@/components/ui/window-component";
import styles from "./InitialUserConfiguration.module.css";
import UsernameInput from "./username-input";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InitialUserConfiguration({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { user, getUser, setUsernameFirstTime } = useTodoDataStore();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchUser = async () => {
      await getUser();
    };

    fetchUser();
  }, []);

  const onSubmit = async (username: string) => {
    const { error } = await setUsernameFirstTime(username);
    if (error || error === "") return error;
    onComplete();
    return null;
  };

  return (
    <>
      <WindowComponent
        windowTitle={"Bienvenido a Alino"}
        closeAction={false}
        adaptative={true}
        bgBlur={true}
        id={"initial-user-configuration-popup"}
      >
        <div className={styles.container}>
          <section className={styles.textsContainer}>
            <p className={styles.subtitle}>
              Antes de comenzar, necesitarás definir el nombre con el que el
              mundo te conocerá. Bueno... o al menos los otros usuarios de
              Alino.
            </p>
            <p className={styles.subtitle}>
              Ya he pensado uno para ti, pero sé que tienes en mente uno mejor.
              ¿O no?
            </p>
          </section>
          {user?.username ? (
            <UsernameInput initialValue={user?.username} onSubmit={onSubmit} />
          ) : (
            <Skeleton
              style={{ width: "100%", height: "45px", borderRadius: "10px" }}
            />
          )}
          <p
            className={styles.subtitle}
            style={{ fontSize: "11px", fontWeight: "200" }}
          >
            *Si no estás seguro ahora no te preocupes, podrás cambiarlo luego,
            ten en cuenta que tu nombre de usuario solo puede contener letras,
            numeros y guiones.
          </p>
        </div>
      </WindowComponent>
    </>
  );
}
