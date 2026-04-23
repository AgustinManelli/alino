"use client";

import React from "react";
import { ModalBox as ModalBoxRoot } from "./modalBox";
import { OptionBox } from "./optionBox";
import styles from "./modalBox/ModalBox.module.css";

interface ModalBoxContentProps {
  children: React.ReactNode;
  className?: string;
}

const ModalBoxContent = ({ children, className }: ModalBoxContentProps) => {
  return (
    <div className={`${styles.content} ${className || ""}`}>{children}</div>
  );
};

const ModalBoxSeparator = () => {
  return <div className={styles.separator} />;
};

export const ModalBox = Object.assign(ModalBoxRoot, {
  Option: OptionBox,
  Content: ModalBoxContent,
  Separator: ModalBoxSeparator,
});
