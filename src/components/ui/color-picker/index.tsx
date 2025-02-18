"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { generatePalette } from "emoji-palette";

import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { EmojiMartPicker } from "@/components/ui/emoji-mart/emoji-mart-picker";

import {
  ArrowThin,
  CopyToClipboardIcon,
  Cross,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./ColorPicker.module.css";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

interface ColorPickerInterface {
  portalRef: React.RefObject<HTMLDivElement>;
  isOpenPicker: boolean;
  setIsOpenPicker: (value: boolean) => void;
  color: string;
  setColor: (value: string, typing?: boolean) => void;
  emoji: string | null;
  setEmoji: (value: string | null) => void;
  active?: boolean;
  setOriginalColor: () => void;
}

export function ColorPicker({
  portalRef, //importamos un ref para el portal
  isOpenPicker, //estado para abrir/cerrar modal
  setIsOpenPicker, //set para el estado de abrir/cerrar modal
  color, //indica el color que está seleccionado en ese momento, no corresponde al original
  setColor, //corresponde a la función para cambiar el valor de los colores temporales, no cambia valor de color original
  emoji, //corresponde al valor del emoji temporal, no al original
  setEmoji, //corresponde a la función para cambiar el valor del emoji temporal, similar a la de color
  active = true, //activar o desactivar funcion de cambiar de color
  setOriginalColor,
}: ColorPickerInterface) {
  //estados locales
  const [type, setType] = useState<string>("color"); //modo color o emoji picker en la modal
  const [flagColor, setFlagColor] = useState<string>(color);

  //estados globales
  const { animations } = useUserPreferencesStore();

  //ref's
  const pickerRef = useRef<HTMLDivElement>(null);

  //funciones
  const onEmojiSelect = (selectedEmoji: emoji) => {
    setEmoji(selectedEmoji.shortcodes as string);
    const palette: string[] = generatePalette(selectedEmoji.native);
    const dominantColor: string = palette[Math.floor(palette.length / 2)];
    setColor(dominantColor);
    setIsOpenPicker(false);
  };

  const ubication = useCallback(() => {
    if (!pickerRef.current || !portalRef.current) return;
    const parentRect = pickerRef.current!.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    portalRef.current.style.top = `${parentRect.top + scrollY + parentRect.height + 5}px`;
    portalRef.current.style.left = `${parentRect.left}px`;

    if (
      pickerRef.current.getBoundingClientRect().top >
      window.innerHeight / 2
    ) {
      portalRef.current.style.top = `${parentRect.top + scrollY - portalRef.current.offsetHeight - 5}px`;
    }
  }, []);

  //useEffect's
  useEffect(() => {
    if (!pickerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      ubication();
    });

    const scrollHandler = () => {
      ubication();
    };

    resizeObserver.observe(pickerRef.current);

    window.addEventListener("scroll", scrollHandler, true);
    window.addEventListener("resize", scrollHandler, true);

    ubication();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scrollHandler, true);
      window.removeEventListener("resize", scrollHandler, true);
    };
  }, [ubication]);

  useEffect(function mount() {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (portalRef.current !== null && pickerRef.current !== null) {
        if (
          !portalRef.current.contains(event.target as Node) &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          const validation = hexColorSchema.safeParse(color);
          if (!validation.success) {
            setOriginalColor();
          }
          setIsOpenPicker(false);
          setType("color");
        }
      }
    }

    window.addEventListener("mousedown", divOnClick);
    window.addEventListener("mouseup", divOnClick);
    ubication();

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
      window.removeEventListener("mouseup", divOnClick);
    };
  });

  const renderIcon = () => (
    <div className={styles.renderIconContainer}>
      {emoji === null || emoji === "" ? (
        <SquircleIcon
          style={{
            fill: `${color}`,
            transition: "fill 0.1s ease-in-out",
            width: "12px",
          }}
        />
      ) : (
        <div style={{ width: "16px", height: "16px" }}>
          <EmojiMartComponent shortcodes={emoji} size="16px" />
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
                    {COLORS.map((colorHex, index) => (
                      <SquircleColorSelector
                        color={color}
                        setColor={setColor}
                        colorHex={colorHex}
                        setIsOpenPicker={setIsOpenPicker}
                        index={index}
                        setEmoji={setEmoji}
                        setFlagColor={setFlagColor}
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
                              {COLORS.includes(color) && (
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
                          setFlagColor(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (e.key === "Enter" || e.key === "Escape") {
                            setIsOpenPicker(false);
                            setColor(target.value);
                            setFlagColor(target.value);
                          }
                        }}
                        onBlur={(e) => {
                          setColor(e.target.value);
                          setFlagColor(e.target.value);
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

export const COLORS = [
  "#ff0048", // Carmesí
  "#f54275", // Rosa fuerte
  "#ff00ea", // Magenta
  "#c800ff", // Púrpura
  "#87189d", // Violeta oscuro
  "#0000ff", // Azul puro
  "#0693e3", // Azul medio
  "#2ccce4", // Azul celeste
  "#00ffbf", // Verde agua
  "#00ff00", // Verde puro
  "#7ed321", // Verde lima
  "#a6ff00", // Verde amarillo
  "#d4ff00", // Amarillo claro
  "#ffdd00", // Amarillo
  "#ffae00", // Naranja
  "#ff6900", // Naranja fuerte
  "#ff4500", // Rojo anaranjado
  "#ff0000", // Rojo puro
];

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
  setFlagColor: (value: string) => void;
}

function SquircleColorSelector({
  color,
  setColor,
  colorHex,
  setIsOpenPicker,
  index,
  setEmoji,
  setFlagColor,
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
          setFlagColor(colorHex);
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
