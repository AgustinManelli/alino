"use client";

import React from "react";

import { WindowComponent } from "@/components/ui/window-component";

import styles from "./ConfigUser.module.css";
import { Edit, UserIcon } from "@/components/ui/icons/icons";
import { Database } from "@/lib/schemas/todo-schema";

type UserComplete = Database["public"]["Tables"]["users"]["Row"];

interface props {
  handleCloseConfig: () => void;
  user: UserComplete | null;
}

export default function ConfigUser({ handleCloseConfig, user }: props) {
  const closeConfigModal = () => {
    const confirmationModal = document.getElementById(
      "confirmation-modal-my-account-config-modal"
    );
    if (confirmationModal) return;
    handleCloseConfig();
  };

  return (
    <WindowComponent
      windowTitle={""}
      id={"list-config-section"}
      crossAction={closeConfigModal}
    >
      <div className={styles.configModalContainer}>
        <section className={styles.userContainer}>
          <div
            className={styles.configUserIcon}
            style={{
              backgroundImage: user?.avatar_url
                ? `url('${user.avatar_url}')`
                : "",
              opacity: user?.avatar_url ? 1 : 0.3,
            }}
          >
            {/* <button className={styles.configUserIconEditorButton}>
              <Edit
                style={{
                  stroke: "var(--text-not-available)",
                  strokeWidth: "2",
                  width: "15px",
                  height: "15px",
                }}
              />
            </button> */}
            {!user?.avatar_url && (
              <UserIcon
                style={{
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "1.5",
                  width: "60%",
                  height: "60%",
                }}
              />
            )}
          </div>
          <h1 className={styles.displayName}>{user?.display_name}</h1>
          <p className={styles.username}>@{user?.username}</p>
        </section>
        <EditionSection
          title={"Nombre"}
          data={user?.display_name}
          btnText={"Cambiar nombre"}
        />
        <EditionSection
          title={"Usuario"}
          data={user?.username}
          btnText={"Cambiar usuario"}
        />
      </div>
    </WindowComponent>
  );
}

interface ESProps {
  title: string;
  data: string | undefined;
  btnText: string;
}

const EditionSection = ({ title, data, btnText }: ESProps) => {
  return (
    <section className={styles.userEditorContainer}>
      <div className={styles.editionContainer}>
        <div>
          <h4>{title}</h4>
          <p>{data}</p>
        </div>
        <button>{btnText}</button>
      </div>
    </section>
  );
};
