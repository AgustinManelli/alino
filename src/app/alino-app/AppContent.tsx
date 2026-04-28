"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";

import { useUserDataStore } from "@/store/useUserDataStore";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { InitialUserConfiguration } from "./components/initial-user-configuration";
import { useDashboardStore } from "@/store/useDashboardStore";
import dynamic from "next/dynamic";

const MiniIndicator = dynamic(
  () =>
    import(
      "./components/todo/HomeDashboard/parts/Pomodoro/MiniIndicator"
    ).then((m) => m.MiniIndicator),
  { ssr: false },
);

import styles from "./AlinoAppLayout.module.css";
import { ModalRenderer } from "@/components/ui/ModalRenderer";

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

  const widgetInstances = useDashboardStore((state) => state.widgetInstances);
  const isPomodoroInstalled = widgetInstances.some(
    (inst) => inst.widgetKey === "pomodoro" && inst.isInstalled,
  );

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
      <ModalRenderer />
      {isPomodoroInstalled && <MiniIndicator />}
      <section className={styles.topButtons}>
        <NotificationsSection />
        <ConfigSection />
      </section>
      <Sidebar />
      {children}
    </>
  );
};
