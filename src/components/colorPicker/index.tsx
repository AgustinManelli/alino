"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./colorPicker.module.css";
import {
  ArrowThin,
  CopyToClipboardIcon,
  LoadingIcon,
  SquircleIcon,
} from "@/lib/ui/icons";
import { toast } from "sonner";
import { motion } from "motion/react";
import { createPortal } from "react-dom";
import { EmojiPicker } from "@/components";
import { EmojiComponent } from "@/components";
import { generatePalette } from "emoji-palette";
import { COLORS } from "./constants/colors";
import useHover from "@/hooks/useHover";

type SquircleColorButonType = {
  color: string;
  setColor: (value: string) => void;
  colorHex: string;
  setChoosingColor?: (value: boolean) => void;
  save?: boolean;
  setIsOpenPicker: (value: boolean) => void;
  setIsSave: (value: boolean) => void;
  index: number;
  setEmoji: (value: string) => void;
};

export function SquircleColorSelector({
  color,
  setColor,
  colorHex,
  // setChoosingColor,
  save,
  setIsOpenPicker,
  setIsSave,
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
          setEmoji("");
          // !save && setChoosingColor && setChoosingColor(false);
          if (!save) {
            setIsOpenPicker(false);
          } else {
            setIsSave(false);
          }
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

interface emoji {
  id: string;
  keywords: string[];
  name: string;
  native: string;
  shortcodes: string;
  unified: string;
}

interface ColorPickerInterface {
  portalRef: React.RefObject<HTMLDivElement>;
  isOpenPicker: boolean;
  setIsOpenPicker: (value: boolean) => void;
  originalColor?: string | null;
  color: string;
  setColor: (value: string) => void;
  originalEmoji?: string;
  emoji: string;
  setEmoji: (value: string) => void;
  save?: boolean;
  handleSave?: () => Promise<void>;
  width?: string;
  active?: boolean;
  // choosingColor?: boolean;
  // setChoosingColor?: (value: boolean) => void;
}

export function ColorPicker({
  portalRef,
  isOpenPicker,
  setIsOpenPicker,
  originalColor, //corresponde al color original del elemento donde se use
  color, //indica el color que está seleccionado en ese momento, no corresponde al original
  setColor, //corresponde a la función para cambiar el valor de los colores temporales, no cambia valor de color original
  originalEmoji, //corresponde al balor del emoji original.
  emoji, //corresponde al valor del emoji temporal, no al original
  setEmoji, //corresponde a la función para cambiar el valor del emoji temporal, similar a la de color
  save, //indica si en el picker debe o no aparecer el boton de guardar para aplicar cambios
  handleSave, //es la función para establecer color ya seleccionado
  width, //corresponde al ancho que debe tener el icono para brir la modal
  active = true,
  // choosingColor, //indicador de si aún se está eligiendo un color
  // setChoosingColor, //función para indicar que el usuario está eligiendo un color o que aún no guardó los cambios
}: ColorPickerInterface) {
  const saveButtonHover = useHover(false);
  const [isSave, setIsSave] = useState<boolean>(false); //indica si el cambio de color temporal se guardó
  const [type, setType] = useState<boolean>(true); //color picker o emoji picker

  const pickerRef = useRef<HTMLDivElement>(null);

  const onEmojiSelect = (selectedEmoji: emoji) => {
    setEmoji(selectedEmoji.shortcodes as string);
    const palette: string[] = generatePalette(selectedEmoji.native);
    const dominantColor: string = palette[0];
    setColor(dominantColor);
    // !save && setChoosingColor && setChoosingColor(false);
    if (!save) {
      setIsOpenPicker(false);
    } else {
      setIsSave(false);
    }
  };

  const ubication = useCallback(() => {
    if (!pickerRef.current || !portalRef.current) return;
    const parentRect = pickerRef.current!.getBoundingClientRect();

    portalRef.current.style.top = `${parentRect.top + parentRect.height + 5}px`;
    portalRef.current.style.left = `${parentRect.left}px`;

    if (
      pickerRef.current.getBoundingClientRect().top >
      window.innerHeight / 2
    ) {
      portalRef.current.style.top = `${parentRect.top - portalRef.current.offsetHeight - 5}px`;
    }
  }, []);

  useEffect(() => {
    if (!pickerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      ubication();
    });

    const scrollHandler = () => {
      ubication();
    };

    // Observe the button element
    resizeObserver.observe(pickerRef.current);

    // Listen for scroll events on window and all parent elements
    window.addEventListener("scroll", scrollHandler, true);

    // Update position on mount and when modal opens
    ubication();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [ubication]);

  useEffect(function mount() {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (portalRef.current !== null && pickerRef.current !== null) {
        if (
          !portalRef.current.contains(event.target as Node) &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          setIsOpenPicker(false);
          // setChoosingColor && setChoosingColor(false);
          setType(true);
          if (save && !isSave && originalColor) {
            setColor(originalColor);
            if (originalEmoji) {
              setEmoji(originalEmoji);
            } else {
              setEmoji("");
            }
          }
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

  return (
    <>
      <div className={styles.fit} ref={pickerRef}>
        <button
          className={styles.mainButton}
          style={{
            backgroundColor: active ? "rgb(0,0,0, 0.05)" : "transparent",
            transition: "background-color 0.1 ease-in-out",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // setChoosingColor && setChoosingColor(!choosingColor);
            active && setIsOpenPicker(!isOpenPicker);
            setType(true);
          }}
        >
          {emoji === "" ? (
            <SquircleIcon
              style={{
                fill: `${color}`,
                transition: "fill 0.1s ease-in-out",
                width: "12px",
              }}
            />
          ) : (
            <div style={{ width: "16px", height: "16px" }}>
              <EmojiComponent shortcodes={emoji} size="16px" />
            </div>
          )}
          {active && (
            <motion.div
              style={{
                width: "fit-content",
                height: "fit-content",
                display: "flex",
              }}
              layout
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: 1,
                width: "18px",
                rotate: isOpenPicker ? 180 : 0,
              }}
              transition={{ duration: 0.1 }}
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
          )}
        </button>
      </div>
      {createPortal(
        <>
          {isOpenPicker && (
            <motion.section
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 40,
              }}
              initial={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: "0.2" },
              }}
              exit={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
              className={`${styles.container} ${
                save ? styles.saveTrueContainer : styles.saveFalseContainer
              }`}
              ref={portalRef}
            >
              <section className={styles.titleSection}>
                <div className={styles.titleSectioButtons}>
                  <button
                    className={styles.title}
                    style={{
                      boxShadow: type
                        ? "0px 1px 1px 0px rgb(0,0,0, 0.1), inset 0 -1px 0 0 rgb(0,0,0,0.05), inset 0 1px 1px 0 rgb(255,255,255, 0.05), 0 1px 2px 0 rgb(0,0,0,0.03)"
                        : "none",
                      backgroundColor: type
                        ? "rgb(245,245,245)"
                        : "transparent",
                      color: type ? "rgb(130,130,130)" : "rgb(200,200,200)",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setType(true);
                    }}
                  >
                    color
                  </button>
                  <button
                    className={styles.title}
                    style={{
                      boxShadow: type
                        ? "none"
                        : "0px 1px 1px 0px rgb(0,0,0, 0.1), inset 0 -1px 0 0 rgb(0,0,0,0.05), inset 0 1px 1px 0 rgb(255,255,255, 0.05), 0 1px 2px 0 rgb(0,0,0,0.03)",
                      backgroundColor: type
                        ? "transparent"
                        : "rgb(245,245,245)",
                      color: type ? "rgb(200,200,200)" : "rgb(130,130,130)",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setType(false);
                    }}
                  >
                    emoji
                  </button>
                </div>
                <div className={styles.separator}></div>
              </section>
              {type ? (
                <div className={styles.colorSelectorContainer}>
                  <section className={styles.buttonSection}>
                    {COLORS.map((colorHex, index) => (
                      <SquircleColorSelector
                        color={color}
                        setColor={setColor}
                        colorHex={colorHex}
                        // setChoosingColor={setChoosingColor}
                        save={save}
                        setIsOpenPicker={setIsOpenPicker}
                        setIsSave={setIsSave}
                        index={index}
                        setEmoji={setEmoji}
                      />
                    ))}
                  </section>
                  <footer className={styles.footer}>
                    <div className={styles.hexContainer}>
                      <div className={styles.inputColorContainer}>
                        <input
                          id="colorInput"
                          type="color"
                          value={color}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setColor(e.target.value);
                            setIsSave(false);
                          }}
                          className={styles.colorInput}
                        ></input>

                        <label
                          htmlFor="colorInput"
                          className={styles.labelColor}
                        >
                          <SquircleIcon
                            style={{ fill: `${color}`, width: "18px" }}
                          />
                          {!COLORS.includes(color) && (
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
                        </label>
                      </div>
                      <input
                        className={styles.hexCode}
                        type="text"
                        value={`${color}`}
                        onChange={(e) => {
                          setColor(e.target.value);
                        }}
                      ></input>
                    </div>
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
                  </footer>
                </div>
              ) : (
                <div
                  className={styles.pickerEmojiContainer}
                  id="emoji-picker-parent"
                >
                  <EmojiPicker
                    // locale={"es"}
                    theme={"light"}
                    onEmojiSelect={onEmojiSelect}
                    emojiButtonRadius={"5px"}
                    maxFrequentRows={0}
                    perLine={6}
                    previewPosition={"none"}
                    searchPosition={"sticky"}
                    skin={1}
                    emojiSize={24}
                    set={"apple"}
                    noCountryFlags={false}
                    navPosition={"none"}
                    // parent={document.querySelector("#emoji-picker-parent")}
                  />
                </div>
              )}
              {save && handleSave && (
                <>
                  <div className={styles.saveButtonContainer}>
                    <div className={styles.separator}></div>
                    <div className={styles.saveButtonButtonContainer}>
                      <button
                        className={styles.saveButton}
                        style={{
                          backgroundColor: saveButtonHover.value
                            ? "rgb(240,240,240)"
                            : "",
                        }}
                        onMouseEnter={() => {
                          saveButtonHover.toggle(true);
                        }}
                        onMouseLeave={() => {
                          saveButtonHover.toggle(false);
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // setWait(true);
                          handleSave();
                          setIsOpenPicker(false);
                          setIsSave(true);
                        }}
                      >
                        <p>guardar</p>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.section>
          )}
        </>,
        // document.body
        document.getElementById("app") as HTMLElement
      )}
    </>
  );
}

export default ColorPicker;
