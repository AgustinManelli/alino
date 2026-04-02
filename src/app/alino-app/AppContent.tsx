"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { InitialUserConfiguration } from "./components/initial-user-configuration";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EditTaskModal } from "@/components/ui/EditTaskModal";
import { PomodoroMiniIndicator } from "@/components/ui/PomodoroMiniIndicator";

import { UserType } from "@/lib/schemas/database.types";

import styles from "./AlinoAppLayout.module.css";

interface Props {
  user: UserType;
  children: React.ReactNode;
}

export const AppContent = ({ user, children }: Props) => {
  const [showConfiguration, setShowConfiguration] = useState(
    user.user_private?.initial_username_prompt_shown ?? false,
  );

  const handleConfigurationComplete = () => {
    setShowConfiguration(false);
  };

  if (showConfiguration) {
    return (
      <AnimatePresence>
        <InitialUserConfiguration onComplete={handleConfigurationComplete} />
      </AnimatePresence>
    );
  }

  return (
    <>
      <RealtimeProvider />
      <EditTaskModal />
      <ConfirmationModal />
      <PomodoroMiniIndicator />
      <section className={styles.topButtons}>
        <NotificationsSection />
        <ConfigSection />
      </section>
      <Sidebar />
      {children}
    </>
  );
};
