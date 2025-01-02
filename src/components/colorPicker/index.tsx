"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./colorPicker.module.css";
import { CopyToClipboardIcon, LoadingIcon, SquircleIcon } from "@/lib/ui/icons";
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
  setOpen: (value: boolean) => void;
  setIsSave: (value: boolean) => void;
  index: number;
  setEmoji: (value: string) => void;
};

export function SquircleColorSelector({
  color,
  setColor,
  colorHex,
  setChoosingColor,
  save,
  setOpen,
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
          !save && setChoosingColor && setChoosingColor(false);
          if (!save) {
            setOpen(false);
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
  originalColor?: string | null;
  color: string;
  setColor: (value: string) => void;
  originalEmoji?: string;
  emoji: string;
  setEmoji: (value: string) => void;
  save?: boolean;
  handleSave?: () => Promise<void>;
  width?: string;
  choosingColor?: boolean;
  setChoosingColor?: (value: boolean) => void;
}

export function ColorPicker({
  originalColor, //corresponde al color original del elemento donde se use
  color, //indica el color que está seleccionado en ese momento, no corresponde al original
  setColor, //corresponde a la función para cambiar el valor de los colores temporales, no cambia valor de color original
  originalEmoji, //corresponde al balor del emoji original.
  emoji, //corresponde al valor del emoji temporal, no al original
  setEmoji, //corresponde a la función para cambiar el valor del emoji temporal, similar a la de color
  save, //indica si en el picker debe o no aparecer el boton de guardar para aplicar cambios
  handleSave, //es la función para establecer color ya seleccionado
  width, //corresponde al ancho que debe tener el icono para brir la modal
  choosingColor, //indicador de si aún se está eligiendo un color
  setChoosingColor, //función para indicar que el usuario está eligiendo un color o que aún no guardó los cambios
}: ColorPickerInterface) {
  const [open, setOpen] = useState<boolean>(false);
  const saveButtonHover = useHover(false);
  const [isSave, setIsSave] = useState<boolean>(false); //indica si el cambio de color temporal se guardó
  const [wait, setWait] = useState<boolean>(false); //saveButton loader
  const [type, setType] = useState<boolean>(true); //color picker o emoji picker

  const pickerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const onEmojiSelect = (selectedEmoji: emoji) => {
    setEmoji(selectedEmoji.shortcodes as string);
    const palette: string[] = generatePalette(selectedEmoji.native);
    const dominantColor: string = palette[0];
    setColor(dominantColor);
  };

  useEffect(function mount() {
    function ubication() {
      if (!pickerRef.current || !childRef.current) return;
      const parentRect = pickerRef.current!.getBoundingClientRect();

      childRef.current.style.top = `${parentRect.top + parentRect.width + 5}px`;
      childRef.current.style.left = `${parentRect.left}px`;

      if (
        pickerRef.current.getBoundingClientRect().top >
        window.innerHeight / 2
      ) {
        childRef.current.style.top = `${parentRect.top - childRef.current.offsetHeight - 5}px`;
      }
    }

    function divOnClick(event: MouseEvent | TouchEvent) {
      if (childRef.current !== null && pickerRef.current !== null) {
        if (
          !childRef.current.contains(event.target as Node) &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
          setChoosingColor && setChoosingColor(false);
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
            width: `${width}`,
            height: `${width}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setChoosingColor && setChoosingColor(!choosingColor);
            setOpen(!open);
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
        </button>
      </div>
      {createPortal(
        <>
          {open ? (
            <motion.section
              ref={childRef}
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
                        setChoosingColor={setChoosingColor}
                        save={save}
                        setOpen={setOpen}
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
                          setWait(true);
                          handleSave()
                            .then(() => {
                              setOpen(false);
                            })
                            .finally(() => {
                              setWait(false);
                              setIsSave(true);
                            });
                        }}
                      >
                        {wait ? (
                          <LoadingIcon
                            style={{
                              width: "20px",
                              height: "auto",
                              stroke: "#1c1c1c",
                              strokeWidth: "3",
                            }}
                          />
                        ) : (
                          <p>guardar</p>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.section>
          ) : (
            ""
          )}
        </>,
        // document.body
        document.getElementById("app") as HTMLElement
      )}
    </>
  );
}

export default ColorPicker;
