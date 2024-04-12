"use client";
import Link from "next/link";
import Styles from "./buttonComponent.module.css";
import { useState } from "react";

interface Props {
  name: string;
  back: string;
  hover: string;
  letterColor: string;
  to: string;
  strokeB: boolean;
  children?: string | JSX.Element | JSX.Element[] | null;
}

export const ButtonComponent: React.FC<Props> = ({
  name,
  back,
  hover,
  letterColor,
  to,
  strokeB,
  children,
}) => {
  const [state, setState] = useState<string>("false");
  const handleState = (inp: string): void => {
    setState(inp);
  };
  return (
    <Link
      href={`${to}`}
      className={Styles.buttonContainer}
      style={{
        backgroundColor: strokeB
          ? state === "true"
            ? `${back}`
            : "transparent"
          : state === "true"
            ? `${hover}`
            : `${back}`,
        color: strokeB
          ? state === "true"
            ? `${letterColor}`
            : `${back}`
          : `${letterColor}`,
        border: strokeB ? `solid ${back} 2px` : "none",
        fontWeight: strokeB ? "600" : "initial",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => {
        handleState("true");
      }}
      onMouseLeave={() => {
        handleState("false");
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
        {name}
      </div>
    </Link>
  );
};
