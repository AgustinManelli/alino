"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./buttonComponent.module.css";
import { useLoaderStore } from "@/store/useLoaderStore";

type Props = {
  text?: string;
  background: string;
  hover: string;
  letterColor: string;
  to: string;
  strokeBorder?: boolean | null;
  children?: string | JSX.Element | JSX.Element[] | null;
  style?: React.CSSProperties;
  withLoader?: boolean;
};

const useHover = () => {
  const [state, setState] = useState<boolean>(false);
  const handleState = (hover: boolean): void => {
    setState(hover);
  };
  return {
    state,
    handleState,
  };
};

export const ButtonComponent = ({
  text,
  background,
  hover,
  letterColor,
  to,
  strokeBorder,
  children,
  style,
  withLoader,
}: Props) => {
  const { state, handleState } = useHover();
  const setLoading = useLoaderStore((state) => state.setLoading);

  const loaderFunctions = () => {
    document.body.style.overflow = "hidden";
    setLoading(true);
  };

  const inlineStyles = {
    backgroundColor: strokeBorder
      ? state === true
        ? `${background}`
        : "transparent"
      : state === true
        ? `${hover}`
        : `${background}`,
    color: strokeBorder
      ? state === true
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
        handleState(true);
      }}
      onMouseLeave={() => {
        handleState(false);
      }}
      onClick={withLoader ? loaderFunctions : () => {}}
    >
      <div className={styles.container}>
        {children}
        {text}
      </div>
    </Link>
  );
};
