"use client";
import Link from "next/link";
import Styles from "./buttonComponent.module.css";
import { useState } from "react";

export default function ButtonComponent({
  name,
  back,
  hover,
  letterColor,
  to,
  strokeB,
}: {
  name: string;
  back: string;
  hover: string;
  letterColor: string;
  to: string;
  strokeB: boolean;
}) {
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
      }}
      onMouseEnter={() => {
        handleState("true");
      }}
      onMouseLeave={() => {
        handleState("false");
      }}
    >
      {name}
    </Link>
  );
}
