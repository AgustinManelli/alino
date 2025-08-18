"use client";

import { useState, useCallback, memo } from "react";
import { AnimatePresence } from "motion/react";

import { ConfigSection } from "./components/config-section";
import Sidebar from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import InitialUserConfiguration from "./components/initial-user-configuration";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import type { User } from "@supabase/supabase-js";
import styles from "./layout.module.css";

interface props {
  initialPromptShown: boolean;
  user: User;
  children: React.ReactNode;
}

export default memo(function AppContent({
  initialPromptShown,
  user,
  children,
}: props) {
  const [showConfiguration, setShowConfiguration] =
    useState(initialPromptShown);

  const handleConfigurationComplete = useCallback(() => {
    setShowConfiguration(false);
  }, []);

  const { name: displayName, avatar_url: userAvatarUrl } = user.user_metadata;

  return (
    <div className={styles.appContainer}>
      <AnimatePresence>
        {showConfiguration && (
          <InitialUserConfiguration onComplete={handleConfigurationComplete} />
        )}
      </AnimatePresence>
      {!showConfiguration && (
        <>
          <ConfirmationModal />
          <section className={styles.topButtons}>
            <NotificationsSection />
            <ConfigSection
              display_name={displayName}
              userAvatarUrl={userAvatarUrl}
            />
          </section>
          <Sidebar />
          {children}
        </>
      )}
    </div>
  );
});
