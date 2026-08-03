"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";

import { useUserDataStore } from "@/store/useUserDataStore";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { StreakSection } from "./components/streak-section";
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

import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

interface Props {
  children: React.ReactNode;
}

export const AppContent = ({ children }: Props) => {
  const user = useUserDataStore((state) => state.user);
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const { sidebarCollapsed, sidebarPosition } = useUserPreferencesStore();

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

  const containerClassName = [
    styles.appContentContainer,
    !isMobile && sidebarPosition === "right" ? styles.sidebarRight : "",
    !isMobile && sidebarCollapsed ? "collapsed" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClassName}>
      <RealtimeProvider />
      <ModalRenderer />
      {isPomodoroInstalled && <MiniIndicator />}
      <section className={styles.topButtons}>
        <StreakSection />
        <NotificationsSection />
        <ConfigSection />
      </section>
      <Sidebar />
      {children}
    </div>
  );
};
