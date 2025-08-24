"use client";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";

import styles from "./ButtonLink.module.css";

interface Props {
  background?: string;
  hoverColor?: string;
  text?: string;
  to: string;
  children?: string | JSX.Element | JSX.Element[] | null;
  withLoader?: boolean;
}

export function ButtonLink({
  background = "var(--background-container)",
  hoverColor = "var(--background-over-container-hover)",
  text = "",
  to,
  children,
  withLoader,
}: Props) {
  const { setLoading } = useNavigationLoader();

  const loaderFunctions = () => {
    setLoading(true);
  };

  return (
    <a
      href={`https://www.${to}`}
      className={styles.buttonContainer}
      onClick={withLoader ? loaderFunctions : () => {}}
      style={
        {
          "--button-bg-color": background,
          "--button-hover-color": hoverColor,
        } as React.CSSProperties
      }
    >
      <div className={styles.container}>
        {children && <div className={styles.iconContainer}>{children}</div>}
        {text && <p>{text}</p>}
      </div>
    </a>
  );
}
