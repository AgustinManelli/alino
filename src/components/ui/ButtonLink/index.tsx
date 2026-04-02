"use client";
import Link from "next/link";
import { useLoaderStore } from "@/store/useLoaderStore";
import styles from "./ButtonLink.module.css";

interface Props {
  href: string;
  text?: string;
  children?: React.ReactNode;
  withLoader?: boolean;
  isExternal?: boolean;
  background?: string;
  hoverColor?: string;
  ariaLabel?: string;
}

export function ButtonLink({
  href,
  text,
  children,
  withLoader,
  isExternal = false,
  background = "var(--background-container)",
  hoverColor = "var(--background-over-container-hover)",
  ariaLabel,
}: Props) {
  const setLoading = useLoaderStore((state) => state.setLoading);

  const handleClick = () => {
    if (withLoader) setLoading(true);
  };

  const cssVariables = {
    "--button-bg-color": background,
    "--button-hover-color": hoverColor,
  } as React.CSSProperties;

  const content = (
    <div className={styles.container}>
      {children && <div className={styles.iconContainer}>{children}</div>}
      {text && <p>{text}</p>}
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={styles.buttonContainer}
        onClick={handleClick}
        style={cssVariables}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={styles.buttonContainer}
      onClick={handleClick}
      style={cssVariables}
      aria-label={ariaLabel}
    >
      {content}
    </Link>
  );
}
