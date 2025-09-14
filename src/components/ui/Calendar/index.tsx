"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { useModalUbication } from "@/hooks/useModalUbication";

import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { HourPicker } from "./HourPicker";

import { DATE_PRESETS, TIME_PRESETS } from "./constants";
import {
  ArrowThin,
  DeleteIcon,
  Calendar as Icon,
} from "@/components/ui/icons/icons";
import styles from "./Calendar.module.css";
import "./DayPicker.css";

interface Props {
  selected: Date | undefined;
  setSelected: (value: Date | undefined) => void;
  hour: string | undefined;
  setHour: (value: string | undefined) => void;
  focusToParentInput?: () => void;
}

export const Calendar = ({
  selected,
  setSelected,
  hour,
  setHour,
  focusToParentInput,
}: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [tempMonth, setTempMonth] = useState<Date | undefined>(new Date());
  const [tempHour, setTempHour] = useState<string | undefined>(undefined);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useModalUbication(
    triggerRef,
    containerRef,
    () => {
      setOpen(false);
    },
    false
  );

  const handleOpenCalendar = () => {
    setOpen((prev) => !prev);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date);
    setTempMonth(date);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleClean = () => {
    setSelected(undefined);
    setHour(undefined);
    setOpen(false);
    setStep(1);
  };

  const handleSetHour = (value: string) => {
    setTempHour(value);
  };

  const HEADER_TITLE = step === 1 ? "Seleccionar fecha" : "Seleccionar hora";

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.triggerButton}
        style={
          {
            backgroundColor: open
              ? "var(--background-over-container-hover)"
              : "var(--background-over-container)",
            "--notification": selected ? 1 : 0,
          } as React.CSSProperties
        }
        onClick={(e) => {
          e.stopPropagation();
          handleOpenCalendar();
        }}
        aria-label="Abrir calendario"
      >
        <Icon
          style={{
            width: "80%",
            height: "auto",
            stroke: "var(--icon-color)",
            strokeWidth: "2",
          }}
        />
      </button>
      <AnimatePresence mode="wait">
        <ClientOnlyPortal>
          {open && (
            <motion.section
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.1,
              }}
              className={styles.calendarContainer}
              ref={containerRef}
              id="calendar-component"
            >
              <div className={styles.contentContainer}>
                <section className={styles.titleContainer}>
                  <section className={styles.titleSection}>
                    {step === 2 && (
                      <button
                        className={styles.backButton}
                        onClick={() => {
                          setStep(1);
                        }}
                      >
                        <ArrowThin
                          style={{
                            width: "auto",
                            height: "15px",
                            stroke: "var(--text)",
                            strokeWidth: "2",
                            transform: "rotate(90deg)",
                          }}
                        />
                      </button>
                    )}
                    <p>{HEADER_TITLE}</p>
                  </section>
                  <button className={styles.cleanButton} onClick={handleClean}>
                    <DeleteIcon
                      style={{
                        width: "auto",
                        height: "15px",
                        stroke: "var(--text)",
                        strokeWidth: "2",
                      }}
                    />
                  </button>
                </section>
                <div className={styles.divisor} />
                {step === 1 ? (
                  <div className={styles.datePicker}>
                    <div className={styles.supportButtons}>
                      {DATE_PRESETS.map((item) => (
                        <button
                          className={styles.supportButtonsElement}
                          onClick={() => {
                            handleDateSelect(item.getDate());
                          }}
                          style={{
                            borderColor:
                              selected?.toDateString() ===
                              item.getDate().toDateString()
                                ? "#87189d"
                                : "var(--border-container-color)",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <DayPicker
                      timeZone="America/Buenos_Aires"
                      mode="single"
                      locale={es}
                      selected={selected}
                      onSelect={handleDateSelect}
                      month={tempMonth}
                      onMonthChange={setTempMonth}
                      defaultMonth={selected}
                      captionLayout="dropdown"
                    />
                    <div className={styles.footerButtonsContainer}>
                      <button
                        className={`${styles.footerButton} ${styles.fb1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel();
                        }}
                      >
                        cancelar
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStep(2);
                          if (!selected) {
                            setSelected(new Date());
                          }
                        }}
                      >
                        siguiente
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.hourPicker}>
                    <div className={styles.supportButtons}>
                      {TIME_PRESETS.map((item) => (
                        <button
                          className={styles.supportButtonsElement}
                          onClick={() => {
                            handleSetHour(item.value);
                          }}
                          style={{
                            borderColor:
                              tempHour === item.value
                                ? "#87189d"
                                : "var(--border-container-color)",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <HourPicker
                      value={hour}
                      tempHour={tempHour}
                      setTempHour={setTempHour}
                    />

                    <div className={styles.footerButtonsContainer}>
                      <button
                        className={`${styles.footerButton} ${styles.fb1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(false);
                          setStep(1);
                          setHour(undefined);
                          focusToParentInput?.();
                        }}
                      >
                        omitir
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        style={{ backgroundColor: "#87189d", color: "#fff" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(false);
                          setStep(1);
                          setHour(
                            tempHour ??
                              new Date().toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                          );
                          focusToParentInput?.();
                        }}
                      >
                        aplicar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </ClientOnlyPortal>
      </AnimatePresence>
    </>
  );
};
