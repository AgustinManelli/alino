"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";

import { useModalUbication } from "@/hooks/useModalUbication";

import { ClientOnlyPortal } from "../client-only-portal";
import { Hour } from "./hour";

import { ArrowThin, Calendar as Icon } from "@/components/ui/icons/icons";
import styles from "./Calendar.module.css";
import "./DayPicker.css";
import { DATE_PRESETS, TIME_PRESETS } from "./constants";

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

  const Ref = useRef<HTMLButtonElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  useModalUbication(
    Ref,
    sRef,
    () => {
      setOpen(false);
      setStep(1);
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
    setSelected(undefined);
    setHour(undefined);
    setOpen(false);
  };

  const handleSetHour = (value: string) => {
    setHour(value);
  };

  return (
    <>
      <button
        ref={Ref}
        className={styles.triggerButton}
        style={{
          backgroundColor: open
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
        onClick={handleOpenCalendar}
      >
        <div
          className={styles.notification}
          style={{ opacity: selected ? 1 : 0 }}
        />
        <Icon
          style={{
            width: "90%",
            height: "auto",
            stroke: "var(--icon-color)",
            strokeWidth: "1.5",
          }}
        />
      </button>
      <ClientOnlyPortal>
        <AnimatePresence mode="wait">
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
              ref={sRef}
              id="calendar-component"
            >
              <div className={styles.contentContainer}>
                <section className={styles.titleContainer}>
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
                          height: "16px",
                          stroke: "var(--text)",
                          strokeWidth: "2",
                          transform: "rotate(90deg)",
                        }}
                      />
                    </button>
                  )}
                  {step === 1 && <p>Seleccionar fecha</p>}
                  {step === 2 && <p>Seleccionar hora</p>}
                </section>
                <div className={styles.divisor} />
                {step === 2 ? (
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
                              hour === item.value
                                ? "#87189d"
                                : "var(--border-container-color)",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <Hour value={hour} onChange={setHour} />

                    <div className={styles.footerButtonsContainer}>
                      <button
                        className={`${styles.footerButton} ${styles.fb1}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          setStep(1);
                          setHour(undefined);
                          focusToParentInput && focusToParentInput();
                        }}
                      >
                        omitir
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        style={{ backgroundColor: "#87189d", color: "#fff" }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          setStep(1);
                          focusToParentInput && focusToParentInput();
                        }}
                      >
                        aplicar
                      </button>
                    </div>
                  </div>
                ) : (
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
                    />
                    <div className={styles.footerButtonsContainer}>
                      <button
                        className={`${styles.footerButton} ${styles.fb1}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancel();
                        }}
                      >
                        cancelar
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        onClick={(e) => {
                          e.preventDefault();
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
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </ClientOnlyPortal>
    </>
  );
};
