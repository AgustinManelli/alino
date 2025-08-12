"use client";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { Modal } from "./modal";

export function WpaDownloadModal() {
  const [open, setOpen] = useState<boolean>(false);

  const { isMobile, isStandalone } = usePlatformInfoStore();
  const { uxPwaPrompt, toggleUxPwaPrompt } = useUserPreferencesStore();

  const handleCloseModal = () => {
    setOpen(false);
    toggleUxPwaPrompt();
  };

  useEffect(() => {
    if (uxPwaPrompt) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {open && isMobile && !isStandalone && (
          <Modal handleCloseModal={handleCloseModal} />
        )}
      </AnimatePresence>
    </>
  );
}
