"use client";

import { useState, memo, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";

import { useUserDataStore } from "@/store/useUserDataStore";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { InitialUserConfiguration } from "./components/initial-user-configuration";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EditTaskModal } from "@/components/ui/edit-task-modal";

import { UserType } from "@/lib/schemas/todo-schema";
import styles from "./AlinoAppLayout.module.css";

interface Props {
  user: UserType;
  children: React.ReactNode;
}

export const AppContent = memo(({ user, children }: Props) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useUserDataStore.setState({ user: user });
      initialized.current = true;
    }
  }, []);

  const [showConfiguration, setShowConfiguration] = useState(
    user.user_private?.initial_username_prompt_shown ?? false
  );

  const handleConfigurationComplete = () => {
    setShowConfiguration(false);
  };

  return (
    <div className={styles.appContentContainer}>
      {showConfiguration && (
        <AnimatePresence>
          <InitialUserConfiguration onComplete={handleConfigurationComplete} />
        </AnimatePresence>
      )}
      {!showConfiguration && (
        <>
          <EditTaskModal />
          <ConfirmationModal />
          <section className={styles.topButtons}>
            <NotificationsSection />
            <ConfigSection />
          </section>
          <Sidebar />
          {children}
        </>
      )}
    </div>
  );
});
