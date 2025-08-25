"use client";

import styles from "./OptionBox.module.css";

interface Props {
  children: React.ReactNode;
  text: string;
  action: () => void;
}

export const OptionBox = ({ children, text, action }: Props) => {
  return (
    <div
      className={styles.box}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      }}
    >
      {children}
      <p>{text}</p>
    </div>
  );
};
