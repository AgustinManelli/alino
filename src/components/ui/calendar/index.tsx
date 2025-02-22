"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import { AnimatePresence, motion } from "motion/react";

import { Hour } from "./hour";

import { ArrowThin, Calendar as Icon } from "@/components/ui/icons/icons";
import styles from "./Calendar.module.css";
import "./DayPicker.css";
import ClientOnlyPortal from "../client-only-portal";

interface props {
  selected: Date | undefined;
  setSelected: (value: Date | undefined) => void;
  hour: string | undefined;
  setHour: (value: string | undefined) => void;
  focusToParentInput?: () => void;
}

export function Calendar({
  selected,
  setSelected,
  hour,
  setHour,
  focusToParentInput,
}: props) {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<boolean>(false);
  const [tempMonth, setTempMonth] = useState<Date | undefined>(new Date());

  const Ref = useRef<HTMLButtonElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  const ubication = () => {
    if (!Ref.current || !sRef.current) return;
    const parentRect = Ref.current!.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    sRef.current.style.top = `${parentRect.top + scrollY + parentRect.height + 5}px`;
    sRef.current.style.left = `${parentRect.left - 252 + parentRect.width}px`;

    if (Ref.current.getBoundingClientRect().top > window.innerHeight / 2) {
      sRef.current.style.top = `${parentRect.top + scrollY - sRef.current.offsetHeight - 5}px`;
    }
  };

  useEffect(() => {
    if (!Ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      ubication();
    });

    const scrollHandler = () => {
      ubication();
    };

    resizeObserver.observe(Ref.current);

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
      if (sRef.current !== null && Ref.current !== null) {
        if (
          !sRef.current.contains(event.target as Node) &&
          !Ref.current.contains(event.target as Node)
        ) {
          setOpen(false);
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

  const handleDateSelect = (date: Date | undefined) => {
    setSelected(date);
    setTempMonth(date);
    // date &&
    //   setTimeout(() => {
    //     setStep(true);
    //   }, 150);
  };

  return (
    <>
      <button
        ref={Ref}
        className={styles.button}
        style={{
          height: "30px",
          width: "auto",
          aspectRatio: "1 / 1",
          backgroundColor: open
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <div
          className={styles.notification}
          style={{ opacity: selected ? 1 : 0 }}
        ></div>
        <Icon
          style={{
            width: "100%",
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
                filter: "blur(10px)",
                z: -50,
                rotateX: 10,
                rotateY: -25,
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                z: 0,
                rotateX: 0,
                rotateY: 0,
              }}
              exit={{
                opacity: 0,
                filter: "blur(10px)",
                z: -50,
                rotateX: 10,
                rotateY: -25,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 25,
                duration: 0.3,
              }}
              className={styles.container}
              ref={sRef}
              id="calendar-component"
            >
              <div className={styles.optionsContainer}>
                {step ? (
                  <div className={styles.hourPicker}>
                    <div className={styles.supportButtons}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setHour("09:00");
                        }}
                        style={{
                          borderColor:
                            hour === "09:00"
                              ? "#87189d"
                              : "var(--border-container-color)",
                        }}
                      >
                        9 am
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setHour("12:00");
                        }}
                        style={{
                          borderColor:
                            hour === "12:00"
                              ? "#87189d"
                              : "var(--border-container-color)",
                        }}
                      >
                        12 pm
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setHour("17:00");
                        }}
                        style={{
                          borderColor:
                            hour === "17:00"
                              ? "#87189d"
                              : "var(--border-container-color)",
                        }}
                      >
                        5 pm
                      </button>
                    </div>

                    <Hour value={hour} onChange={setHour} />

                    <div className={styles.footerButtonsContainer}>
                      <button
                        className={`${styles.footerButton} ${styles.fb1}`}
                        onClick={() => {
                          setStep(false);
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
                        atrás
                      </button>
                      <button
                        className={styles.hourButtonOmit}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          setStep(false);
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
                          setStep(false);
                          if (!hour) {
                            setHour(
                              new Date().toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            );
                          }
                          focusToParentInput && focusToParentInput();
                        }}
                      >
                        aplicar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.supportButtons}>
                      <button
                        onClick={() => {
                          handleDateSelect(new Date());
                        }}
                        style={{
                          borderColor:
                            selected?.toDateString() ===
                            new Date().toDateString()
                              ? "#87189d"
                              : "var(--border-container-color)",
                        }}
                      >
                        Hoy
                      </button>
                      <button
                        onClick={() => {
                          const date = new Date();
                          date.setDate(date.getDate() + 7);
                          handleDateSelect(date);
                        }}
                        style={{
                          borderColor:
                            selected?.toDateString() ===
                            new Date(
                              new Date().setDate(new Date().getDate() + 7)
                            ).toDateString()
                              ? "#87189d"
                              : "var(--border-container-color)",
                        }}
                      >
                        7 días
                      </button>
                      <button
                        onClick={() => {
                          const date = new Date();
                          date.setMonth(date.getMonth() + 1);
                          handleDateSelect(date);
                        }}
                        style={{
                          borderColor:
                            selected?.toDateString() ===
                            new Date(
                              new Date().setMonth(new Date().getMonth() + 1)
                            ).toDateString()
                              ? "#87189d"
                              : "var(--border-container-color)",
                        }}
                      >
                        1 mes
                      </button>
                    </div>
                    <DayPicker
                      // disabled={{ before: new Date() }}
                      timeZone="America/Buenos_Aires"
                      mode="single"
                      locale={es}
                      selected={selected}
                      onSelect={handleDateSelect}
                      month={tempMonth}
                      onMonthChange={setTempMonth}
                      // startMonth={new Date()}
                      defaultMonth={selected}
                    />
                    <div className={styles.footerButtonsContainer}>
                      <button
                        className={`${styles.footerButton} ${styles.fb1}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                        }}
                      >
                        cancelar
                      </button>
                      <button
                        className={`${styles.footerButton} ${styles.fb2}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStep(true);
                          if (!selected) {
                            setSelected(new Date());
                          }
                        }}
                      >
                        siguiente
                        <ArrowThin
                          style={{
                            width: "auto",
                            height: "15px",
                            stroke: "#fff",
                            strokeWidth: "3",
                            transform: "rotate(-90deg)",
                          }}
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </ClientOnlyPortal>
    </>
  );
}
