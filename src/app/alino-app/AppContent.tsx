"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useUserDataStore } from "@/store/useUserDataStore";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { useSidebarStateStore } from "@/store/useSidebarStateStore";
import { useDeferredLoading } from "@/hooks/useDeferredLoading";

import { ConfigSection } from "./components/config-section";
import { Sidebar } from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import { StreakSection } from "./components/streak-section";
import { useDashboardStore } from "@/store/useDashboardStore";
import dynamic from "next/dynamic";

const InitialUserConfiguration = dynamic(
  () =>
    import("./components/initial-user-configuration").then(
      (m) => m.InitialUserConfiguration,
    ),
  { ssr: false },
);

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

  const pendingListId = useSidebarStateStore((state) => state.pendingListId);
  const isNavigating = useDeferredLoading(pendingListId !== null, 150);

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
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0, transformOrigin: "0% 50%" }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "2.5px",
              zIndex: 99999,
              background: "linear-gradient(90deg, #008FFD, #6AC3FF)",
              boxShadow: "0 0 10px rgba(0, 143, 253, 0.7)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
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
