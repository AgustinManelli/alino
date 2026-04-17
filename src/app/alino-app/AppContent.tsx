"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";

import { useUserDataStore } from "@/store/useUserDataStore";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { InitialUserConfiguration } from "./components/initial-user-configuration";
import { EditTaskModal } from "@/components/ui/EditTaskModal";
import { PomodoroMiniIndicator } from "@/components/ui/PomodoroMiniIndicator";

import styles from "./AlinoAppLayout.module.css";
import { ModalRenderer } from "@/components/ui/ModalRenderer";
import { NormalToaster } from "@/components/ui/toaster/normal-toaster";
import { AlertCircleIcon } from "@/components/ui/icons/icons";

interface Props {
  children: React.ReactNode;
}

export const AppContent = ({ children }: Props) => {
  const user = useUserDataStore((state) => state.user);

  const [showConfiguration, setShowConfiguration] = useState(
    user?.user_private?.initial_username_prompt_shown ?? false,
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
      <ModalRenderer />
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
