"use client";

import React, {
  useRef,
  useState,
  useCallback,
  memo,
  CSSProperties,
} from "react";
import { motion } from "motion/react";
import colorsData from "../colors.json";

import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useModalUbication } from "@/hooks/useModalUbication";

import { ClientOnlyPortal } from "../../ClientOnlyPortal";

import { hexColorSchema } from "@/lib/schemas/list/validation";

import {
  ArrowThin,
  Cross,
  FolderClosed,
  FolderOpen,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./FolderColorPicker.module.css";
import CopyToClipboard from "@/components/ui/CopyToClipboard";

const modalInitial = { scale: 0, opacity: 0, filter: "blur(30px)" };
const modalAnimate = {
  scale: 1,
  opacity: 1,
  filter: "blur(0px)",
  transition: { duration: 0.2 },
};
const modalExit = { scale: 0, opacity: 0, filter: "blur(30px)" };
const modalTransition = {
  type: "spring" as const,
  stiffness: 700,
  damping: 40,
};

const arrowInitial = { opacity: 0, width: 0, marginRight: 0, scale: 0 };
const arrowAnimate = {
  opacity: 1,
  width: "16px",
  marginRight: "10px",
  scale: 1,
};

interface Props {
  color: string | null;
  setColor: (value: string, typing?: boolean) => void;
  active?: boolean;
  setOriginalColor: () => void;
  folderOpen?: boolean;
}

export const FolderColorPicker = memo(function FolderColorPicker({
  color = "#1c1c1c",
  setColor,
  setOriginalColor,
  folderOpen = false,
}: Props) {
  const [isOpenPicker, setIsOpenPicker] = useState<boolean>(false);

  const { animations } = useUserPreferencesStore();
  const pickerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useModalUbication(pickerRef, portalRef, () => {
    const validation = hexColorSchema.safeParse(color);
    if (!validation.success) {
      setOriginalColor();
    }
    setIsOpenPicker(false);
  });

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpenPicker((prev) => !prev);
  };

  const isColorValid = hexColorSchema.safeParse(color).success && color;

  return (
    <>
      <motion.div className={styles.pickerContainer} ref={pickerRef}>
        <motion.button
          key="color-picker-selector"
          className={styles.mainButton}
          animate={
            animations
              ? {
                  paddingLeft: "10px",
                  backgroundColor: "var(--background-over-container)",
                }
              : undefined
          }
          transition={
            animations ? { paddingLeft: { duration: 0.2 } } : undefined
          }
          exit={
            animations
              ? {
                  paddingLeft: "0px",
                  backgroundColor: "transparent",
                }
              : undefined
          }
          style={{
            backgroundColor: "var(--background-over-container)",
            paddingLeft: animations ? undefined : "10px",
            cursor: "pointer",
          }}
          onClick={togglePicker}
        >
          <div
            className={styles.renderIconContainer}
            style={
              {
                "--color": color ?? "var(--text-not-available)",
              } as React.CSSProperties
            }
          >
            {folderOpen ? (
              <FolderOpen className={styles.folderIcon} />
            ) : (
              <FolderClosed className={styles.folderIcon} />
            )}
          </div>
          <motion.div
            layout
            key="color-picker-arrow"
            className={styles.arrowContainer}
            initial={animations ? arrowInitial : undefined}
            animate={animations ? arrowAnimate : undefined}
            exit={animations ? arrowInitial : undefined}
          >
            <motion.div
              animate={{ rotate: isOpenPicker ? 180 : 0 }}
              transition={
                animations
                  ? {
                      rotate: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }
                  : { rotate: { duration: 0.2 } }
              }
              style={{
                width: "fit-content",
                height: "fit-content",
                display: "flex",
              }}
            >
              <ArrowThin className={styles.arrowIcon} />
            </motion.div>
          </motion.div>
        </motion.button>
      </motion.div>
      <ClientOnlyPortal>
        {isOpenPicker && (
          <motion.section
            className={`${styles.modalContainer} ignore-sidebar-close color-picker-portal`}
            ref={portalRef}
            initial={modalInitial}
            animate={modalAnimate}
            exit={modalExit}
            transition={modalTransition}
            id="color-picker-container-folder"
          >
            <p className={styles.titleText}>Color de carpeta</p>
            <div className={styles.separator}></div>
            <div className={styles.colorSelectorContainer}>
              <section className={styles.buttonSection}>
                {colorsData.COLORS.map((colorHex) => (
                  <SquircleColorSelector
                    key={colorHex}
                    isSelected={color === colorHex}
                    setColor={setColor}
                    colorHex={colorHex}
                    setIsOpenPicker={setIsOpenPicker}
                  />
                ))}
              </section>
              <footer className={styles.footer}>
                <div className={styles.hexContainer}>
                  <div className={styles.inputColorContainer}>
                    <input
                      className={styles.inputColor}
                      id="colorInput"
                      type="color"
                      value={color ?? undefined}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setColor(e.target.value);
                      }}
                    />
                    <label
                      htmlFor="colorInput"
                      className={styles.labelColor}
                      style={{ "--color": color } as CSSProperties}
                    >
                      {isColorValid ? (
                        <>
                          <SquircleIcon className={styles.squircleIcon} />
                          {colorsData.COLORS.includes(color) && (
                            <SquircleIcon
                              className={styles.squircleIconBorder}
                            />
                          )}
                        </>
                      ) : (
                        <Cross
                          style={{
                            width: "18px",
                            stroke: "var(--icon-color)",
                            strokeWidth: "3",
                          }}
                        />
                      )}
                    </label>
                  </div>
                  <input
                    className={styles.hexCode}
                    type="text"
                    value={color ?? undefined}
                    onChange={(e) => setColor(e.target.value, true)}
                    onKeyDown={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (e.key === "Enter" || e.key === "Escape") {
                        setIsOpenPicker(false);
                        setColor(target.value);
                      }
                    }}
                    onBlur={(e) => setColor(e.target.value)}
                  />
                  <CopyToClipboard
                    text={color}
                    successMessage="Color copiado al portapapeles"
                  />
                </div>
              </footer>
            </div>
          </motion.section>
        )}
      </ClientOnlyPortal>
    </>
  );
});

interface SquircleColorButtonType {
  isSelected: boolean;
  setColor: (value: string) => void;
  colorHex: string;
  setIsOpenPicker: (value: boolean) => void;
}

const SquircleColorSelector = memo(function SquircleColorSelector({
  isSelected,
  setColor,
  colorHex,
  setIsOpenPicker,
}: SquircleColorButtonType) {
  const [hoverColor, setHoverColor] = useState<boolean>(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setColor(colorHex);
      setIsOpenPicker(false);
    },
    [colorHex, setColor, setIsOpenPicker],
  );

  const handleMouseEnter = useCallback(() => setHoverColor(true), []);
  const handleMouseLeave = useCallback(() => setHoverColor(false), []);

  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.button}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SquircleIcon style={{ fill: `${colorHex}`, width: "18px" }} />
        <SquircleIcon
          style={{
            fill: "transparent",
            position: "absolute",
            width: "30px",
            strokeWidth: "1.5",
            stroke: isSelected
              ? `${colorHex}`
              : hoverColor
                ? `${colorHex}`
                : "var(--border-container-color)",
            transition: "stroke 0.3s ease-in-out",
          }}
        />
      </button>
    </div>
  );
});
