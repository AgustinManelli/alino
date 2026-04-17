"use client";

import React, { useRef, useState, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { generatePalette } from "emoji-palette";

import { EmojiMartComponent } from "@/components/ui/EmojiMart/emoji-mart-component";
import { EmojiMartPicker } from "@/components/ui/EmojiMart/emoji-mart-picker";
import colorsData from "../colors.json";

import { useModalUbication } from "@/hooks/useModalUbication";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { hexColorSchema } from "@/lib/schemas/list/validation";

import {
  ArrowThin,
  CopyToClipboardIcon,
  Cross,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./ColorPicker.module.css";
import { customToast } from "@/lib/toasts";

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

interface EmojiType {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
}

interface Props {
  color: string | null;
  setColor: (value: string, typing?: boolean) => void;
  emoji: string | null;
  setEmoji: (value: string | null) => void;
  active?: boolean;
  setOriginalColor: () => void;
  uniqueId?: string;
  big?: boolean;
}

export function ColorPicker({
  color = "#1c1c1c",
  setColor,
  emoji,
  setEmoji,
  setOriginalColor,
  uniqueId = "",
  big = false,
}: Props) {
  const [isOpenPicker, setIsOpenPicker] = useState<boolean>(false);
  const [type, setType] = useState<string>("color");

  const { animations } = useUserPreferencesStore();
  const pickerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const onEmojiSelect = useCallback(
    (selectedEmoji: EmojiType) => {
      setEmoji(selectedEmoji.shortcodes as string);
      const palette: string[] = generatePalette(selectedEmoji.native);
      const dominantColor: string = palette[Math.floor(palette.length / 2)];
      setColor(dominantColor);
      setIsOpenPicker(false);
    },
    [setColor, setEmoji],
  );

  useModalUbication(pickerRef, portalRef, () => {
    const validation = hexColorSchema.safeParse(color);
    if (!validation.success) {
      setOriginalColor();
    }
    setIsOpenPicker(false);
    setType("color");
  });

  const togglePicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpenPicker((prev) => !prev);
    setType("color");
  };

  const copyToClipboard = useCallback(() => {
    if (color) {
      navigator.clipboard.writeText(color);
      customToast.success("Color copiado al portapapeles");
    }
  }, [color]);

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
            style={{
              width: big ? "20px" : "16px",
              height: big ? "20px" : "16px",
            }}
          >
            {!emoji ? (
              <SquircleIcon
                style={{
                  fill: color ?? "var(--text-not-available)",
                  transition: "fill 0.3s ease-in-out",
                  width: big ? "16px" : "12px",
                }}
              />
            ) : (
              <div
                style={{
                  width: big ? "20px" : "16px",
                  height: big ? "20px" : "16px",
                }}
              >
                <EmojiMartComponent
                  shortcodes={emoji}
                  size={big ? "20px" : "16px"}
                />
              </div>
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
                        type: "spring" as const,
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
              <ArrowThin
                style={{
                  stroke: "var(--icon-color)",
                  strokeWidth: "1.5",
                  width: "18px",
                  height: "auto",
                }}
              />
            </motion.div>
          </motion.div>
        </motion.button>
      </motion.div>

      {createPortal(
        <>
          {isOpenPicker && (
            <motion.section
              className={`${styles.modalContainer} ignore-sidebar-close color-picker-portal`}
              ref={portalRef}
              initial={modalInitial}
              animate={modalAnimate}
              exit={modalExit}
              transition={modalTransition}
              id={`color-picker-container-${uniqueId}`}
            >
              <section className={styles.titleSection}>
                <div
                  className={styles.titleButtons}
                  style={{
                    justifyContent:
                      type === "color" ? "flex-start" : "flex-end",
                  }}
                >
                  <motion.div className={styles.titleSelector} layout />
                  <button
                    className={styles.title}
                    style={{
                      color:
                        type === "color"
                          ? "var(--text)"
                          : "var(--text-not-available)",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setType("color");
                    }}
                  >
                    color
                  </button>
                  <button
                    className={styles.title}
                    style={{
                      color:
                        type === "emoji"
                          ? "var(--text)"
                          : "var(--text-not-available)",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setType("emoji");
                    }}
                  >
                    emoji
                  </button>
                </div>
              </section>

              <div className={styles.separator}></div>

              {type === "color" ? (
                <div className={styles.colorSelectorContainer}>
                  <section className={styles.buttonSection}>
                    {colorsData.COLORS.map((colorHex) => (
                      <SquircleColorSelector
                        key={colorHex}
                        isSelected={color === colorHex}
                        setColor={setColor}
                        colorHex={colorHex}
                        setIsOpenPicker={setIsOpenPicker}
                        setEmoji={setEmoji}
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
                        >
                          {isColorValid ? (
                            <>
                              <SquircleIcon
                                style={{ fill: `${color}`, width: "18px" }}
                              />
                              {colorsData.COLORS.includes(color) && (
                                <SquircleIcon
                                  style={{
                                    fill: "transparent",
                                    position: "absolute",
                                    width: "30px",
                                    strokeWidth: "1.5",
                                    stroke: `${color}`,
                                  }}
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
                      <button
                        disabled={!color}
                        onClick={copyToClipboard}
                        className={styles.copyButton}
                        style={{
                          opacity: !color ? 0.3 : 1,
                          cursor: !color ? "initial" : "pointer",
                        }}
                      >
                        <CopyToClipboardIcon
                          style={{
                            strokeWidth: "1.5",
                            stroke: "var(--icon-color)",
                            width: "20px",
                          }}
                        />
                      </button>
                    </div>
                  </footer>
                </div>
              ) : (
                <div
                  className={styles.pickerEmojiContainer}
                  id="emoji-picker-parent"
                >
                  <EmojiMartPicker
                    theme="light"
                    onEmojiSelect={onEmojiSelect}
                    emojiButtonRadius="5px"
                    maxFrequentRows={0}
                    perLine={6}
                    previewPosition="none"
                    searchPosition="static"
                    skin={1}
                    emojiSize={24}
                    dynamicWidth
                    set="apple"
                    noCountryFlags={false}
                    navPosition="none"
                  />
                </div>
              )}
            </motion.section>
          )}
        </>,
        document.body,
      )}
    </>
  );
}

interface SquircleColorButtonType {
  isSelected: boolean;
  setColor: (value: string) => void;
  colorHex: string;
  setIsOpenPicker: (value: boolean) => void;
  setEmoji: (value: string | null) => void;
}

const SquircleColorSelector = memo(function SquircleColorSelector({
  isSelected,
  setColor,
  colorHex,
  setIsOpenPicker,
  setEmoji,
}: SquircleColorButtonType) {
  const [hoverColor, setHoverColor] = useState<boolean>(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setColor(colorHex);
      setEmoji(null);
      setIsOpenPicker(false);
    },
    [colorHex, setColor, setEmoji, setIsOpenPicker],
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
