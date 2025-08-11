"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";

// Importa tus componentes
import { ConfigSection } from "./components/config-section";
import Sidebar from "./components/sidebar";
import { NotificationsSection } from "./components/notifications";
import InitialUserConfiguration from "./components/initial-user-configuration";
import styles from "./layout.module.css";

interface AppContentProps {
  initialPromptShown: boolean;
  user: User;
  children: React.ReactNode;
}

export default function AppContent({
  initialPromptShown,
  user,
  children,
}: AppContentProps) {
  const [showConfiguration, setShowConfiguration] =
    useState(initialPromptShown);

  const handleConfigurationComplete = () => {
    setShowConfiguration(false);
  };

  return (
    <div className={styles.appContainer}>
      {showConfiguration ? (
        <InitialUserConfiguration onComplete={handleConfigurationComplete} />
      ) : (
        <>
          <ConfigSection
            display_name={user.user_metadata.name}
            userAvatarUrl={user.user_metadata.avatar_url}
          />
          <NotificationsSection />
          <Sidebar />
          {children}
        </>
      )}
    </div>
  );
}
