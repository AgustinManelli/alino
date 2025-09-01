"use client";

import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import colorsData from "../colors.json";

import {
  ArrowThin,
  CopyToClipboardIcon,
  Cross,
  FolderClosed,
  FolderOpen,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import styles from "./FolderColorPicker.module.css";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useModalUbication } from "@/hooks/useModalUbication";
import { ClientOnlyPortal } from "../../client-only-portal";

interface props {
  color: string | null;
  setColor: (value: string, typing?: boolean) => void;
  active?: boolean;
  setOriginalColor: () => void;
  folderOpen?: boolean;
}

export function FolderColorPicker({
  color = "#1c1c1c", //indica el color que está seleccionado en ese momento, no corresponde al original
  setColor, //corresponde a la función para cambiar el valor de los colores temporales, no cambia valor de color original
  active = true, //activar o desactivar funcion de cambiar de color (estatico o color-picker)
  setOriginalColor,
  folderOpen = false,
}: props) {
  //estados locales
  const [isOpenPicker, setIsOpenPicker] = useState<boolean>(false); //estado para abrir o cerrar color-picker-container
  const [type, setType] = useState<string>("color"); //modo color o emoji picker en la modal

  //estados globales
  const { animations } = useUserPreferencesStore();

  //ref's
  const pickerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

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
      {folderOpen ? (
        <FolderOpen
          style={{
            stroke: color ?? "var(--text-not-available)",
            width: "15px",
            height: "15px",
            strokeWidth: 2,
            transition: "fill 0.3s ease-in-out",
          }}
        />
      ) : (
        <FolderClosed
          style={{
            stroke: color ?? "var(--text-not-available)",
            width: "15px",
            height: "15px",
            strokeWidth: 2,
            transition: "fill 0.3s ease-in-out",
          }}
        />
      )}
    </div>
  );

  const titleButtons = (typeSelected: string, titleButton: string) => (
    <button
      className={styles.title}
      style={{
        color:
          type === typeSelected ? "var(--text)" : "var(--text-not-available)",
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
            className={`${styles.mainButton} ${!active ? styles.inactive : ""}`}
            animate={
              animations ? { paddingLeft: active ? "10px" : "0px" } : undefined
            }
            transition={
              animations ? { paddingLeft: { duration: 0.2 } } : undefined
            }
            style={{
              backgroundColor: active
                ? "var(--background-over-container)"
                : "transparent",
              paddingLeft: animations ? undefined : active ? "10px" : "5px",
            }}
            onClick={(e) => {
              if (!active) return;
              e.preventDefault();
              e.stopPropagation();
              setIsOpenPicker((v) => !v);
              setType("color");
            }}
            aria-disabled={!active}
            tabIndex={active ? 0 : -1}
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
                          marginRight: "10px",
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
                        stroke: "var(--icon-color)",
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
      <ClientOnlyPortal>
        {isOpenPicker && (
          <motion.section
            className={`${styles.modalContainer} ignore-sidebar-close`}
            ref={portalRef}
            initial={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: 0.2 },
            }}
            exit={{ scale: 0, opacity: 0, filter: "blur(30px)" }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 40,
            }}
            id={`color-picker-container-folder`}
          >
            {/* <section className={styles.titleSection}>
              <div
                className={styles.titleButtons}
                style={{
                  justifyContent:
                    "flex-" + (type === "color" ? "start" : "end"),
                }}
              >
                <motion.div className={styles.titleSelector} layout />
                {titleButtons("icono", "icono")}
                {titleButtons("color", "color")}
              </div>
            </section> */}
            <p className={styles.titleText}>Color de carpeta</p>

            <div className={styles.separator}></div>

            {type === "color" && (
              <div className={styles.colorSelectorContainer}>
                <section className={styles.buttonSection}>
                  {colorsData.COLORS.map((colorHex, index) => (
                    <SquircleColorSelector
                      color={color}
                      setColor={setColor}
                      colorHex={colorHex}
                      setIsOpenPicker={setIsOpenPicker}
                      index={index}
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
                      ></input>
                      <label htmlFor="colorInput" className={styles.labelColor}>
                        {hexColorSchema.safeParse(color).success && color ? (
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
                      disabled={!color}
                      onClick={() => {
                        if (color) {
                          navigator.clipboard.writeText(color);
                          toast("color copiado al portapapeles");
                        }
                      }}
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
            )}
          </motion.section>
        )}
      </ClientOnlyPortal>
    </>
  );
}

interface SquircleColorButonType {
  color: string | null;
  setColor: (value: string) => void;
  colorHex: string;
  setIsOpenPicker: (value: boolean) => void;
  index: number;
}

function SquircleColorSelector({
  color,
  setColor,
  colorHex,
  setIsOpenPicker,
  index,
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
                  : "var(--border-container-color)",
            transition: "stroke 0.3s ease-in-out",
          }}
        />
      </button>
    </div>
  );
}
