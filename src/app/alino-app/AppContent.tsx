"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";

import { useUserDataStore } from "@/store/useUserDataStore";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { InitialUserConfiguration } from "./components/initial-user-configuration";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EditTaskModal } from "@/components/ui/EditTaskModal";

import { UserType } from "@/lib/schemas/todo-schema";
import styles from "./AlinoAppLayout.module.css";

interface Props {
  user: UserType;
}

export const AppContent = ({ user }: Props) => {
  const [showConfiguration, setShowConfiguration] = useState(
    user.user_private?.initial_username_prompt_shown ?? false
  );

  const initialized = useRef(false);

  const handleConfigurationComplete = () => {
    setShowConfiguration(false);
  };

  useEffect(() => {
    if (!initialized.current) {
      useUserDataStore.setState({ user });
      initialized.current = true;
    }
  }, [user]);

  return showConfiguration ? (
    <AnimatePresence>
      <InitialUserConfiguration onComplete={handleConfigurationComplete} />
    </AnimatePresence>
  ) : (
    <>
      <RealtimeProvider />
      <EditTaskModal />
      <ConfirmationModal />
      <section className={styles.topButtons}>
        <NotificationsSection />
        <ConfigSection />
      </section>
      <Sidebar />
    </>
  );
};
