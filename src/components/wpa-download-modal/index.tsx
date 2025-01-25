"use client";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

import useMobileStore from "@/store/useMobileStore";

import { Modal } from "./modal";

export function WpaDownloadModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isMobile, setIsMobile } = useMobileStore();

  const handleCloseModal = (value: boolean) => {
    setIsOpen(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-user-md", "false");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIsOpen = localStorage.getItem("pwa-user-md");
      if (storedIsOpen === null) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
      setIsOpen(JSON.parse(storedIsOpen));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 850);
    };

    // Inicializar con el valor actual
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && !isStandalone && (
          <Modal setIsOpen={handleCloseModal} />
        )}
      </AnimatePresence>
    </>
  );
}
