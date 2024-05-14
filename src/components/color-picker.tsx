"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./color-picker.module.css";
import { CopyToClipboardIcon, LoadingIcon, SquircleIcon } from "@/lib/ui/icons";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import EmojiPicker from "./emoji-mart";
import EmojiComponent from "./emoji-mart-component";
import { generatePalette } from "emoji-palette";

const colors = [
  "#f54275",
  "#ff00ea",
  "#87189d",
  "#0693e3",
  "#2ccce4",
  "#7ed321",
  "#a6ff00",
  "#ffdd00",
  "#ff6900",
  "#ff0004",
];

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
          setChoosingColor && setChoosingColor(false);
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
        <SquircleIcon style={{ fill: `${colorHex}` }} />
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

export function ColorPicker({
  color,
  setColor,
  save,
  handleSave,
  width,
  originalColor,
  choosingColor,
  setChoosingColor,
  setEmoji,
  emoji,
  originalEmoji,
}: {
  color: string;
  setColor: (value: string) => void;
  save?: boolean;
  handleSave?: () => Promise<void>;
  width?: string;
  originalColor?: string | null;
  choosingColor?: boolean;
  setChoosingColor?: (value: boolean) => void;
  setEmoji: (value: string) => void;
  emoji: string;
  originalEmoji?: string;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [isSave, setIsSave] = useState<boolean>(false);
  const [wait, setWait] = useState<boolean>(false);
  const [type, setType] = useState<boolean>(true);

  const pickerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  const onEmojiSelect = (selectedEmoji: emoji) => {
    setEmoji(selectedEmoji.shortcodes as string);
    const palette: string[] = generatePalette(selectedEmoji.native);
    // const dominantColor: string = palette[Math.floor(palette.length / 2)];
    const dominantColor: string = palette[0];
    setColor(dominantColor);
  };

  useEffect(function mount() {
    function ubication() {
      if (!pickerRef.current || !childRef.current) return;
      const parentRect = pickerRef.current!.getBoundingClientRect();

      childRef.current.style.top = `${parentRect.top + parentRect.width + 10}px`;
      childRef.current.style.left = `${parentRect.left}px`;

      if (
        pickerRef.current.getBoundingClientRect().top >
        window.innerHeight / 2
      ) {
        childRef.current.style.top = `${parentRect.top - childRef.current.offsetHeight - 10}px`;
      }
    }
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (childRef.current !== null && pickerRef.current !== null) {
        if (
          !childRef.current.contains(event.target as Node) &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
          setChoosingColor ? setChoosingColor(false) : "";
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
        <AnimatePresence>
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
              className={styles.container}
              style={{
                maxHeight: type ? "256px" : "365px",
                minHeight: type ? "256px" : "365px",
              }}
            >
              <section className={styles.titleSection}>
                <button
                  className={styles.title}
                  style={{
                    boxShadow: type
                      ? "0px 1px 1px 0px rgb(0,0,0, 0.1), inset 0 -1px 0 0 rgb(0,0,0,0.05), inset 0 1px 1px 0 rgb(255,255,255, 0.05), 0 1px 2px 0 rgb(0,0,0,0.03)"
                      : "none",
                    backgroundColor: type ? "rgb(245,245,245)" : "transparent",
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
                    backgroundColor: type ? "transparent" : "rgb(245,245,245)",
                    color: type ? "rgb(200,200,200)" : "rgb(130,130,130)",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setType(false);
                  }}
                >
                  emoji
                </button>
              </section>
              <div className={styles.separator}></div>
              {type ? (
                <div className={styles.colorSelectorContainer}>
                  <section className={styles.buttonSection}>
                    {colors.map((colorHex, index) => (
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
                          <SquircleIcon style={{ fill: `${color}` }} />
                          {!colors.includes(color) && (
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
                    perLine={7}
                    previewPosition={"none"}
                    searchPosition={"sticky"}
                    skin={1}
                    emojiSize={24}
                    set={"apple"}
                    noCountryFlags={true}
                    // parent={document.querySelector("#emoji-picker-parent")}
                  />
                </div>
              )}
              {save && handleSave && (
                <>
                  <div className={styles.separator}></div>
                  <div className={styles.saveButtonContainer}>
                    <button
                      className={styles.saveButton}
                      style={{
                        backgroundColor: hover ? "rgb(240,240,240)" : "",
                      }}
                      onMouseEnter={() => {
                        setHover(true);
                      }}
                      onMouseLeave={() => {
                        setHover(false);
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
                        "guardar"
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.section>
          ) : (
            ""
          )}
        </AnimatePresence>,
        // document.body
        document.getElementById("app") as HTMLElement
      )}
    </>
  );
}
