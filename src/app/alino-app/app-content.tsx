"use client";

import { useState, useCallback, memo, useEffect } from "react";
import { AnimatePresence } from "motion/react";

import { ConfigSection } from "./components/config-section";
import Sidebar from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import InitialUserConfiguration from "./components/initial-user-configuration";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { UserType } from "@/lib/schemas/todo-schema";

import styles from "./layout.module.css";

interface props {
  user: UserType;
  children: React.ReactNode;
}

export default memo(function AppContent({ user, children }: props) {
  useEffect(() => {
    useTodoDataStore.setState({ user: user });
  }, [user]);

  const [showConfiguration, setShowConfiguration] = useState(
    user.user_private?.initial_username_prompt_shown ?? false
  );

  const handleConfigurationComplete = useCallback(() => {
    setShowConfiguration(false);
  }, []);

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
            <ConfigSection />
          </section>
          <Sidebar />
          {children}
        </>
      )}
    </div>
  );
});
