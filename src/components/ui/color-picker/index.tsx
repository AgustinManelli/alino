"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { generatePalette } from "emoji-palette";

import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { EmojiMartPicker } from "@/components/ui/emoji-mart/emoji-mart-picker";
import colorsData from "./colors.json";

import {
  ArrowThin,
  CopyToClipboardIcon,
  Cross,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./ColorPicker.module.css";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useModalUbication } from "@/hooks/useModalUbication";

interface ColorPickerInterface {
  color: string;
  setColor: (value: string, typing?: boolean) => void;
  emoji: string | null;
  setEmoji: (value: string | null) => void;
  active?: boolean;
  setOriginalColor: () => void;
  uniqueId?: string;
  big?: boolean;
}

export function ColorPicker({
  color, //indica el color que está seleccionado en ese momento, no corresponde al original
  setColor, //corresponde a la función para cambiar el valor de los colores temporales, no cambia valor de color original
  emoji, //corresponde al valor del emoji temporal, no al original
  setEmoji, //corresponde a la función para cambiar el valor del emoji temporal, similar a la de color
  active = true, //activar o desactivar funcion de cambiar de color (estatico o color-picker)
  setOriginalColor,
  uniqueId = "",
  big = false,
}: ColorPickerInterface) {
  //estados locales

  const [isOpenPicker, setIsOpenPicker] = useState<boolean>(false); //estado para abrir o cerrar color-picker-container
  const [type, setType] = useState<string>("color"); //modo color o emoji picker en la modal

  //estados globales
  const { animations } = useUserPreferencesStore();

  //ref's
  const pickerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  //funciones
  const onEmojiSelect = (selectedEmoji: emoji) => {
    setEmoji(selectedEmoji.shortcodes as string);
    const palette: string[] = generatePalette(selectedEmoji.native);
    const dominantColor: string = palette[Math.floor(palette.length / 2)];
    setColor(dominantColor);
    setIsOpenPicker(false);
  };

  useModalUbication(pickerRef, portalRef, () => {
    const validation = hexColorSchema.safeParse(color);
    if (!validation.success) {
      setOriginalColor();
    }
    setIsOpenPicker(false);
    setType("color");
  });

  const renderIcon = () => (
    <div className={styles.renderIconContainer}>
      {emoji === null || emoji === "" ? (
        <SquircleIcon
          style={{
            fill: `${color}`,
            transition: "fill 0.1s ease-in-out",
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
          <EmojiMartComponent shortcodes={emoji} size={big ? "20px" : "16px"} />
        </div>
      )}
    </div>
  );

  const titleButtons = (typeSelected: string, titleButton: string) => (
    <button
      className={styles.title}
      style={{
        color: type === typeSelected ? "#1c1c1c" : "rgb(210,210,210)",
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setType(typeSelected);
      }}
    >
      {titleButton}
    </button>
  );

  return (
    <>
      <div className={styles.pickerContainer} ref={pickerRef}>
        <AnimatePresence>
          <motion.button
            key={"color-picker-selector"}
            className={styles.mainButton}
            animate={
              animations ? { paddingLeft: active ? "10px" : "5px" } : undefined
            }
            transition={
              animations ? { paddingLeft: { duration: 0.2 } } : undefined
            }
            style={{
              backgroundColor: active ? "rgb(0,0,0, 0.05)" : "transparent",
              paddingLeft: animations ? undefined : active ? "10px" : "5px",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              active && setIsOpenPicker(!isOpenPicker);
              setType("color");
            }}
            disabled={!active}
          >
            {renderIcon()}
            <AnimatePresence>
              {active && (
                <motion.div
                  layout
                  key={"color-picker-arrow"}
                  className={styles.arrowContainer}
                  initial={
                    animations
                      ? {
                          opacity: 0,
                          width: 0,
                          marginRight: 0,
                          scale: 0,
                        }
                      : undefined
                  }
                  animate={
                    animations
                      ? {
                          opacity: 1,
                          width: "16px",
                          marginRight: "5px",
                          scale: 1,
                        }
                      : undefined
                  }
                  exit={
                    animations
                      ? { opacity: 0, width: 0, marginRight: 0, scale: 0 }
                      : undefined
                  }
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
                        : {
                            rotate: {
                              duration: 0.2,
                            },
                          }
                    }
                    style={{
                      width: "fit-content",
                      height: "fit-content",
                      display: "flex",
                    }}
                  >
                    <ArrowThin
                      style={{
                        stroke: "#000",
                        strokeWidth: "1.5",
                        width: "18px",
                        height: "auto",
                      }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </AnimatePresence>
      </div>
      {createPortal(
        <>
          {isOpenPicker && (
            <motion.section
              className={styles.modalContainer}
              ref={portalRef}
              initial={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: "0.2" },
              }}
              exit={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 40,
              }}
              id={`color-picker-container-${uniqueId}`}
            >
              <section className={styles.titleSection}>
                <div
                  className={styles.titleButtons}
                  style={{
                    justifyContent:
                      "flex-" + (type === "color" ? "start" : "end"),
                  }}
                >
                  <motion.div className={styles.titleSelector} layout />
                  {titleButtons("color", "color")}
                  {titleButtons("emoji", "emoji")}
                </div>
              </section>

              <div className={styles.separator}></div>

              {type === "color" ? (
                <div className={styles.colorSelectorContainer}>
                  <section className={styles.buttonSection}>
                    {colorsData.COLORS.map((colorHex, index) => (
                      <SquircleColorSelector
                        color={color}
                        setColor={setColor}
                        colorHex={colorHex}
                        setIsOpenPicker={setIsOpenPicker}
                        index={index}
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
                          value={color}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setColor(e.target.value);
                          }}
                        ></input>
                        <label
                          htmlFor="colorInput"
                          className={styles.labelColor}
                        >
                          {hexColorSchema.safeParse(color).success ? (
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
                                stroke: "#999999",
                                strokeWidth: "3",
                              }}
                            />
                          )}
                        </label>
                      </div>
                      <input
                        className={styles.hexCode}
                        type="text"
                        value={`${color}`}
                        onChange={(e) => {
                          setColor(e.target.value, true);
                        }}
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (e.key === "Enter" || e.key === "Escape") {
                            setIsOpenPicker(false);
                            setColor(target.value);
                          }
                        }}
                        onBlur={(e) => {
                          setColor(e.target.value);
                        }}
                      ></input>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(color);
                          toast("color copiado al portapapeles");
                        }}
                        className={styles.copyButton}
                      >
                        <CopyToClipboardIcon
                          style={{
                            strokeWidth: "1.5",
                            stroke: "#1c1c1c",
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
                    // locale={"es"}
                    theme={"light"}
                    onEmojiSelect={onEmojiSelect}
                    emojiButtonRadius={"5px"}
                    maxFrequentRows={0}
                    perLine={6}
                    previewPosition={"none"}
                    searchPosition={"static"}
                    skin={1}
                    emojiSize={24}
                    dynamicWidth
                    set={"apple"}
                    noCountryFlags={false}
                    navPosition={"none"}
                  />
                </div>
              )}
            </motion.section>
          )}
        </>,
        // document.getElementById("app") as HTMLElement
        document.body
      )}
    </>
  );
}

interface emoji {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
}

interface SquircleColorButonType {
  color: string;
  setColor: (value: string) => void;
  colorHex: string;
  setIsOpenPicker: (value: boolean) => void;
  index: number;
  setEmoji: (value: string | null) => void;
}

function SquircleColorSelector({
  color,
  setColor,
  colorHex,
  setIsOpenPicker,
  index,
  setEmoji,
}: SquircleColorButonType) {
  const [hoverColor, setHoverColor] = useState<boolean>(false);
  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setColor(colorHex);
          setEmoji(null);
          setIsOpenPicker(false);
        }}
        key={index}
        onMouseEnter={() => {
          setHoverColor(true);
        }}
        onMouseLeave={() => {
          setHoverColor(false);
        }}
      >
        <SquircleIcon style={{ fill: `${colorHex}`, width: "18px" }} />
        <SquircleIcon
          style={{
            fill: "transparent",
            position: "absolute",
            width: "30px",
            strokeWidth: "1.5",
            stroke:
              color === colorHex
                ? `${colorHex}`
                : hoverColor
                  ? `${colorHex}`
                  : "rgb(245,245,245)",
            transition: "stroke 0.3s ease-in-out",
          }}
        />
      </button>
    </div>
  );
}
