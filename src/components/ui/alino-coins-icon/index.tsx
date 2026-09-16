"use client";

import React, { useId } from "react";
import { motion } from "motion/react";

interface AlinoCoinIconProps {
  amount?: number;
  variant?: "auto" | "single" | "stack" | "bag";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  animated?: boolean;
}

export const AlinoCoinIcon: React.FC<AlinoCoinIconProps> = ({
  amount = 1,
  variant = "auto",
  size = 18,
  className,
  style,
  animated = false,
}) => {
  /*
   * Auto:
   * 1-10      → moneda
   * 11-99     → stack
   * 100+      → bolsa
   */
  const resolvedVariant =
    variant === "auto"
      ? amount > 300
        ? "bag"
        : amount > 100
          ? "stack"
          : "single"
      : variant;

  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const coinGrad = `coin-grad-${id}`;
  const coinShadow = `coin-shadow-${id}`;

  const commonStyle: React.CSSProperties = {
    display: "inline-block",
    verticalAlign: "middle",
    flexShrink: 0,
  };

  const SingleCoin = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={!animated ? className : undefined}
      style={{
        ...commonStyle,
        ...(!animated ? style : {}),
      }}
    >
      <defs>
        <linearGradient id={coinGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE86A" />
          <stop offset="100%" stopColor="#F4B400" />
        </linearGradient>

        <linearGradient id={coinShadow} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D89400" />
          <stop offset="100%" stopColor="#B87500" />
        </linearGradient>
      </defs>

      {/* Sombra */}
      <ellipse
        cx="16"
        cy="28"
        rx="8"
        ry="2"
        fill="#000"
        opacity="0.12"
      />

      {/* Borde / espesor */}
      <circle
        cx="16"
        cy="17"
        r="11.5"
        fill={`url(#${coinShadow})`}
      />

      {/* Cara */}
      <circle
        cx="16"
        cy="15.5"
        r="11.5"
        fill={`url(#${coinGrad})`}
        stroke="#B97800"
        strokeWidth="1.5"
      />

      {/* Brillo superior */}
      <ellipse
        cx="12"
        cy="11.5"
        rx="4.8"
        ry="2.4"
        fill="#FFF4A8"
        opacity="0.9"
        transform="rotate(-20 12 11.5)"
      />

      {/* Símbolo */}
      <path
        d="
          M16 8.5
          L17.7 12.8
          L21.8 14.5
          L17.7 16.2
          L16 20.5
          L14.3 16.2
          L10.2 14.5
          L14.3 12.8
          Z
        "
        fill="#FFF7BE"
        stroke="#E2A900"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* Pequeño brillo */}
      <circle
        cx="21.2"
        cy="9.4"
        r="1"
        fill="#FFFFFF"
        opacity="0.85"
      />
    </svg>
  );

  const StackCoins = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 32"
      width={size * 1.25}
      height={size}
      className={!animated ? className : undefined}
      style={{
        ...commonStyle,
        ...(!animated ? style : {}),
      }}
    >
      {/* Sombra */}
      <ellipse
        cx="20"
        cy="29"
        rx="13"
        ry="2"
        fill="#000"
        opacity="0.12"
      />

      {/* Moneda trasera */}
      <ellipse
        cx="14"
        cy="20"
        rx="9"
        ry="6"
        fill="#C98700"
      />

      <ellipse
        cx="14"
        cy="18"
        rx="9"
        ry="6"
        fill="#F6BB19"
        stroke="#B97800"
        strokeWidth="1.4"
      />

      {/* Moneda del medio */}
      <ellipse
        cx="25"
        cy="17"
        rx="9"
        ry="6"
        fill="#D99700"
      />

      <ellipse
        cx="25"
        cy="15"
        rx="9"
        ry="6"
        fill="#FFD84D"
        stroke="#B97800"
        strokeWidth="1.4"
      />

      {/* Moneda superior */}
      <ellipse
        cx="18"
        cy="9"
        rx="10"
        ry="6.5"
        fill="#D99700"
      />

      <ellipse
        cx="18"
        cy="7"
        rx="10"
        ry="6.5"
        fill="#FFD84D"
        stroke="#B97800"
        strokeWidth="1.5"
      />

      {/* Brillo */}
      <ellipse
        cx="14"
        cy="5.5"
        rx="4"
        ry="1.8"
        fill="#FFF3A0"
        opacity="0.9"
        transform="rotate(-12 14 5.5)"
      />

      {/* Símbolo */}
      <path
        d="
          M18 3
          L19.5 6
          L22.5 7
          L19.5 8.3
          L18 11
          L16.5 8.3
          L13.5 7
          L16.5 6
          Z
        "
        fill="#FFF8C7"
        stroke="#E0A800"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );

  const CoinBag = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size * 1.2}
      height={size * 1.2}
      className={!animated ? className : undefined}
      style={{
        ...commonStyle,
        ...(!animated ? style : {}),
      }}
    >
      {/* Sombra */}
      <ellipse
        cx="20"
        cy="36"
        rx="11"
        ry="2.5"
        fill="#000"
        opacity="0.12"
      />

      {/* Bolsa */}
      <path
        d="
          M11 14
          C11 11 14 9 20 9
          C26 9 29 11 29 14

          L31 28
          C31.4 32 27 35 20 35
          C13 35 8.6 32 9 28
          Z
        "
        fill="#D99620"
        stroke="#9A6200"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Parte central iluminada */}
      <path
        d="
          M13 16
          C15 14 18 13.5 20 13.5
          C22 13.5 25 14 27 16
          L28 27
          C28.2 30 24.8 32 20 32
          C15.2 32 11.8 30 12 27
          Z
        "
        fill="#F4BC32"
      />

      {/* Boca de la bolsa */}
      <path
        d="
          M10 14
          C13 16.5 27 16.5 30 14
          L29 10
          C25 12 15 12 11 10
          Z
        "
        fill="#FFC94D"
        stroke="#9A6200"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Cuerda */}
      <path
        d="
          M11 11
          C14 13 26 13 29 11
        "
        fill="none"
        stroke="#8A5700"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Monedas sobresaliendo */}
      <ellipse
        cx="15"
        cy="10"
        rx="4"
        ry="2.5"
        fill="#D99400"
      />

      <ellipse
        cx="15"
        cy="8.8"
        rx="4"
        ry="2.5"
        fill="#FFD84D"
        stroke="#B97800"
        strokeWidth="1.1"
      />

      <ellipse
        cx="20"
        cy="9"
        rx="4"
        ry="2.5"
        fill="#E5A500"
      />

      <ellipse
        cx="20"
        cy="7.7"
        rx="4"
        ry="2.5"
        fill="#FFE15A"
        stroke="#B97800"
        strokeWidth="1.1"
      />

      <ellipse
        cx="25"
        cy="10"
        rx="4"
        ry="2.5"
        fill="#D99400"
      />

      <ellipse
        cx="25"
        cy="8.8"
        rx="4"
        ry="2.5"
        fill="#FFD84D"
        stroke="#B97800"
        strokeWidth="1.1"
      />

      {/* Brillo de la bolsa */}
      <path
        d="M14 20C15 17 17 16 18 16"
        fill="none"
        stroke="#FFE58A"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Estrellita decorativa */}
      <path
        d="
          M27 20
          L28 22
          L30 23
          L28 24
          L27 26
          L26 24
          L24 23
          L26 22
          Z
        "
        fill="#FFF3A3"
      />
    </svg>
  );

  let svgContent: React.ReactNode;

  switch (resolvedVariant) {
    case "bag":
      svgContent = CoinBag;
      break;

    case "stack":
      svgContent = StackCoins;
      break;

    default:
      svgContent = SingleCoin;
      break;
  }

  if (animated) {
    return (
      <motion.span
        className={className}
        style={{
          display: "inline-flex",
          verticalAlign: "middle",
          flexShrink: 0,
          ...style,
        }}
        whileHover={{
          scale: 1.08,
          rotate: 4,
        }}
        whileTap={{
          scale: 0.92,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        {svgContent}
      </motion.span>
    );
  }

  return svgContent;
};