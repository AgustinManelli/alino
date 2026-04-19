"use client";

import { useRef, useState, useCallback, useMemo } from "react";
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
  className?: string;
}

const modalMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.1 },
};

const arrowStyle = {
  width: "auto",
  height: "15px",
  stroke: "var(--text)",
  strokeWidth: "2",
  transform: "rotate(90deg)",
};

const deleteIconStyle = {
  width: "auto",
  height: "15px",
  stroke: "var(--text)",
  strokeWidth: "2",
};

export const Calendar = ({
  selected,
  setSelected,
  hour,
  setHour,
  focusToParentInput,
  className,
}: Props) => {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [tempMonth, setTempMonth] = useState<Date | undefined>(selected);
  const [tempHour, setTempHour] = useState<string | undefined>(hour);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCloseCalendar = useCallback(() => setOpen(false), []);

  useModalUbication(triggerRef, containerRef, handleCloseCalendar, false);

  const handleOpenCalendar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }, []);

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      setSelected(date);
      setTempMonth(date);
    },
    [setSelected],
  );

  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  }, []);

  const handleClean = useCallback(() => {
    setSelected(undefined);
    setHour(undefined);
    setOpen(false);
    setStep(1);
  }, [setSelected, setHour]);

  const handleBackToStep1 = useCallback(() => setStep(1), []);

  const handleGoToStep2 = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setStep(2);
      if (!selected) {
        setSelected(new Date());
      }
    },
    [selected, setSelected],
  );

  const handleApplyHour = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(false);
      setStep(1);
      setHour(
        tempHour ??
          new Date().toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
      );
      focusToParentInput?.();
    },
    [tempHour, setHour, focusToParentInput],
  );

  const handleSkipHour = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(false);
      setStep(1);
      setHour(undefined);
      focusToParentInput?.();
    },
    [setHour, focusToParentInput],
  );

  const triggerStyle = useMemo(
    () =>
      ({
        backgroundColor: open
          ? "var(--background-over-container-hover)"
          : "var(--background-over-container)",
        "--notification": selected ? 1 : 0,
      }) as React.CSSProperties,
    [open, selected],
  );

  const HEADER_TITLE = step === 1 ? "Seleccionar fecha" : "Seleccionar hora";

  return (
    <>
      <button
        ref={triggerRef}
        className={`${styles.triggerButton} ${className || ""}`.trim()}
        style={triggerStyle}
        onClick={handleOpenCalendar}
        aria-label="Abrir calendario"
      >
        <Icon
          className={`${styles.calendarIcon} ${open ? styles.calendarActive : ""}`}
        />
      </button>
      <AnimatePresence mode="wait">
        <ClientOnlyPortal>
          {open && (
            <motion.section
              initial={modalMotion.initial}
              animate={modalMotion.animate}
              exit={modalMotion.exit}
              transition={modalMotion.transition}
              className={`${styles.calendarContainer} no-close-edit`}
              ref={containerRef}
              id="calendar-component"
            >
              <div className={styles.contentContainer}>
                <section className={styles.titleContainer}>
                  <section className={styles.titleSection}>
                    {step === 2 && (
                      <button
                        className={styles.backButton}
                        onClick={handleBackToStep1}
                      >
                        <ArrowThin style={arrowStyle} />
                      </button>
                    )}
                    <p>{HEADER_TITLE}</p>
                  </section>
                  <button className={styles.cleanButton} onClick={handleClean}>
                    <DeleteIcon style={deleteIconStyle} />
                  </button>
                </section>
                <div className={styles.divisor} />
                {step === 1 ? (
                  <div className={styles.datePicker}>
                    <div className={styles.supportButtons}>
                      {DATE_PRESETS.map((item, idx) => (
                        <PresetDateButton
                          key={idx}
                          item={item}
                          selected={selected}
                          onSelect={handleDateSelect}
                        />
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
                        onClick={handleCancel}
                      >
                        cancelar
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        onClick={handleGoToStep2}
                      >
                        siguiente
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.hourPicker}>
                    <div className={styles.supportButtons}>
                      {TIME_PRESETS.map((item, idx) => (
                        <PresetTimeButton
                          key={idx}
                          item={item}
                          tempHour={tempHour}
                          onSelect={setTempHour}
                        />
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
                        onClick={handleSkipHour}
                      >
                        omitir
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        style={{ backgroundColor: "#87189d", color: "#fff" }}
                        onClick={handleApplyHour}
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

interface PresetDateProps {
  item: { label: string; getDate: () => Date };
  selected: Date | undefined;
  onSelect: (date: Date) => void;
}

const PresetDateButton = ({ item, selected, onSelect }: PresetDateProps) => {
  const isSelected = selected?.toDateString() === item.getDate().toDateString();
  const handleClick = useCallback(
    () => onSelect(item.getDate()),
    [item, onSelect],
  );

  return (
    <button
      className={styles.supportButtonsElement}
      onClick={handleClick}
      style={{
        borderColor: isSelected ? "#87189d" : "var(--border-container-color)",
      }}
    >
      {item.label}
    </button>
  );
};

interface PresetTimeProps {
  item: { label: string; value: string };
  tempHour: string | undefined;
  onSelect: (value: string) => void;
}

const PresetTimeButton = ({ item, tempHour, onSelect }: PresetTimeProps) => {
  const isSelected = tempHour === item.value;
  const handleClick = useCallback(() => onSelect(item.value), [item, onSelect]);

  return (
    <button
      className={styles.supportButtonsElement}
      onClick={handleClick}
      style={{
        borderColor: isSelected ? "#87189d" : "var(--border-container-color)",
      }}
    >
      {item.label}
    </button>
  );
};
