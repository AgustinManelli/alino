"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as Icon } from "@/components/ui/icons/icons";
import styles from "./Calendar.module.css";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";
import "./DayPicker.css";
import { Hour } from "./hour";
import { AnimatePresence, motion } from "motion/react";

import { useSwipeable } from "react-swipeable";

interface props {
  selected: Date | undefined;
  setSelected: (value: Date | undefined) => void;
  hour: string | undefined;
  setHour: (value: string | undefined) => void;
}

export function Calendar({ selected, setSelected, hour, setHour }: props) {
  const [open, setOpen] = useState<boolean>(false);
  const [step, setStep] = useState<boolean>(false);

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
    date &&
      setTimeout(() => {
        setStep(true);
      }, 150);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setSelected(
        selected && new Date(selected.getFullYear(), selected.getMonth() + 1, 1)
      ),
    onSwipedRight: () =>
      setSelected(
        selected && new Date(selected.getFullYear(), selected.getMonth() - 1, 1)
      ),
    trackMouse: true,
  });

  return (
    <>
      <button
        ref={Ref}
        className={styles.button}
        style={{
          height: "30px",
          width: "auto",
          aspectRatio: "1 / 1",
          backgroundColor: open ? "rgb(240, 240, 240)" : "rgb(250,250,250)",
        }}
        onClick={() => {
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
            stroke: "#1c1c1c",
            strokeWidth: "1.5",
          }}
        />
      </button>
      {createPortal(
        <>
          <AnimatePresence mode="wait">
            {open && (
              <motion.section
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
                className={styles.container}
                ref={sRef}
              >
                <p className={styles.title}>
                  {step ? "Hora" : "Fecha"} límite para tu tarea
                </p>
                <div className={styles.divisor}></div>
                <div className={styles.optionsContainer} {...handlers}>
                  {step ? (
                    <div className={styles.hourPicker}>
                      <Hour value={hour} onChange={setHour} />
                      {/* <p className={styles.hourParaph}>
                        *Puedes omitir el horario
                      </p> */}
                      <div className={styles.hourButtonsContainer}>
                        <button
                          className={styles.hourButtons}
                          onClick={() => {
                            setStep(false);
                          }}
                        >
                          atras
                        </button>
                        <button
                          className={styles.hourButtons}
                          style={{ backgroundColor: "#87189d", color: "#fff" }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(false);
                            setStep(false);
                            setHour(
                              new Date().toLocaleTimeString("es-AR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })
                            );
                          }}
                        >
                          siguiente
                        </button>
                      </div>
                      <button
                        className={styles.hourButtonOmit}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          setStep(false);
                          setHour(undefined);
                        }}
                      >
                        omitir
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.supporButtons}>
                        <button
                          onClick={() => {
                            handleDateSelect(new Date());
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
                        >
                          7 días
                        </button>
                        <button
                          onClick={() => {
                            const date = new Date();
                            date.setMonth(date.getMonth() + 1);
                            handleDateSelect(date);
                          }}
                        >
                          1 mes
                        </button>
                      </div>
                      <DayPicker
                        disabled={{ before: new Date() }}
                        timeZone="America/Buenos_Aires"
                        mode="single"
                        locale={es}
                        selected={selected}
                        onSelect={handleDateSelect}
                        startMonth={new Date()}
                        defaultMonth={selected}
                        //   footer={
                        //     selected
                        //       ? `Selección: ${selected.toLocaleDateString()}`
                        //       : "Pick a day."
                        //   }
                      />
                    </>
                  )}
                  {selected && (
                    <div className={styles.limitDateContainer}>
                      <p>
                        Fecha límite: {selected?.toLocaleDateString()} {hour}
                      </p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
