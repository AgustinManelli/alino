"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./ButtonLink.module.css";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";

interface props {
  text?: string;
  background: string;
  hover: string;
  letterColor: string;
  to: string;
  strokeBorder?: boolean | null;
  children?: string | JSX.Element | JSX.Element[] | null;
  style?: React.CSSProperties;
  withLoader?: boolean;
}

export function ButtonLink({
  text,
  background,
  hover,
  letterColor,
  to,
  strokeBorder,
  children,
  style,
  withLoader,
}: props) {
  const [isHover, setIsHover] = useState<boolean>(false);

  const { setLoading } = useNavigationLoader();

  const loaderFunctions = () => {
    setLoading(true);
  };

  const inlineStyles = {
    backgroundColor: strokeBorder
      ? isHover === true
        ? `${background}`
        : "transparent"
      : isHover === true
        ? `${hover}`
        : `${background}`,
    color: strokeBorder
      ? isHover === true
        ? `${letterColor}`
        : `${background}`
      : `${letterColor}`,
    border: strokeBorder ? `solid ${background} 2px` : "none",
    fontWeight: strokeBorder ? "600" : "initial",
  };

  const combinedStyles = Object.assign({}, inlineStyles, style);

  return (
    <Link
      href={`${to}`}
      className={styles.buttonContainer}
      style={combinedStyles}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      onClick={withLoader ? loaderFunctions : () => {}}
    >
      <div className={styles.container} style={{ gap: text ? "7px" : 0 }}>
        {children && <div className={styles.iconContainer}>{children}</div>}
        <p>{text}</p>
      </div>
    </Link>
  );
}
