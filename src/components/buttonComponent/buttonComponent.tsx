"use client";
import Link from "next/link";
import Styles from "./buttonComponent.module.css";
import { useState } from "react";

interface Props {
  text?: string;
  background: string;
  hover: string;
  letterColor: string;
  to: string;
  strokeBorder: boolean;
  children?: string | JSX.Element | JSX.Element[] | null;
  style?: React.CSSProperties;
}

export const ButtonComponent: React.FC<Props> = ({
  text,
  background,
  hover,
  letterColor,
  to,
  strokeBorder,
  children,
  style,
}) => {
  const [state, setState] = useState<boolean>(false);
  const handleState = (inp: boolean): void => {
    setState(inp);
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const combinedStyles = Object.assign({}, inlineStyles, style);
  return (
    <Link
      href={`${to}`}
      className={Styles.buttonContainer}
      style={combinedStyles}
      onMouseEnter={() => {
        handleState(true);
      }}
      onMouseLeave={() => {
        handleState(false);
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "7px",
        }}
      >
        {children}
        {text}
      </div>
    </Link>
  );
};
