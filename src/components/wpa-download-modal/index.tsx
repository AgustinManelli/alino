"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

import useMobileStore from "@/store/useMobileStore";

import { Modal } from "./modal";

export function WpaDownloadModal() {
  // const storedIsOpen = localStorage.getItem("pwa-user-md");
  // const [isOpen, setIsOpen] = useState(
  //   storedIsOpen ? JSON.parse(storedIsOpen) : false
  // );
  // const { isMobile, setIsMobile } = useMobileStore();
  const [isOpen, setIsOpen] = useState<boolean>();
  const handleCloseModal = (value: boolean) => {
    setIsOpen(value);
    // localStorage.setItem("pwa-user-md", "false");
  };

  // useEffect(() => {
  //   if (storedIsOpen === null) {
  //     const timer = setTimeout(() => {
  //       setIsOpen(true);
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [storedIsOpen]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth < 850);
  //   };

  //   // Inicializar con el valor actual
  //   handleResize();

  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  // const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <>
      {/* <AnimatePresence> */}
      {/* {isOpen && isMobile && !isStandalone && ( */}
      <Modal setIsOpen={handleCloseModal} />
      {/* )} */}
      {/* </AnimatePresence> */}
    </>
  );
}
