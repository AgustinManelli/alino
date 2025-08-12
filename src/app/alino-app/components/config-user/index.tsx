"use client";

import { useState } from "react";
import React from "react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { WindowComponent } from "@/components/ui/window-component";

import styles from "./ConfigUser.module.css";
import { UserIcon } from "@/components/ui/icons/icons";
import { Database } from "@/lib/schemas/todo-schema";

type UserComplete = Database["public"]["Tables"]["users"]["Row"];

interface props {
  handleCloseConfig: () => void;
  user: UserComplete | null;
}

export default function ConfigUser({ handleCloseConfig, user }: props) {
  const { animations, toggleAnimations } = useUserPreferencesStore();

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
          {/* seccion de foto de perfil, display_name y username no editable */}
          <div
            className={styles.configUserIcon}
            style={{
              backgroundImage: user?.avatar_url
                ? `url('${user.avatar_url}')`
                : "",
              opacity: user?.avatar_url ? 1 : 0.3,
            }}
          >
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
        <section></section>
        <section></section>
      </div>
    </WindowComponent>
  );
}
