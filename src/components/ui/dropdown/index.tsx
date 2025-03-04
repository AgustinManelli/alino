"use client";

import { useState, ReactNode, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Dropdown.module.css";
import { createPortal } from "react-dom";
import ClientOnlyPortal from "../client-only-portal";
interface DropdownProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  triggerLabel: () => ReactNode;
  selectedListHome: T | undefined;
  setSelectedListHome: (value: T) => void;
  handleFocusToParentInput?: () => void;
}

export function Dropdown<T>({
  items,
  renderItem,
  triggerLabel,
  selectedListHome,
  setSelectedListHome,
  handleFocusToParentInput,
}: DropdownProps<T>) {
  const [open, setOpen] = useState<boolean>(false);

  const Ref = useRef<HTMLButtonElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  const ubication = () => {
    if (!Ref.current || !sRef.current) return;
    const parentRect = Ref.current!.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    sRef.current.style.top = `${parentRect.top + scrollY + parentRect.height + 5}px`;
    sRef.current.style.left = `${parentRect.left - 150 + parentRect.width}px`;

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

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  return (
    <>
      <button
        ref={Ref}
        className={styles.triggerButton}
        style={{
          height: "30px",
          width: "30px",
          aspectRatio: "1 / 1",
          backgroundColor: open
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
        onClick={toggleDropdown}
      >
        {triggerLabel()}
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
              className={styles.dropdownMenu}
              ref={sRef}
              id="dropdown-component"
            >
              <div className={styles.items}>
                {items
                  .filter((item) => item !== selectedListHome)
                  .map((item, index) => (
                    <motion.button
                      key={`dropdown-index-${index}`}
                      className={styles.dropdownItem}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeDropdown();
                        setSelectedListHome(item);
                        handleFocusToParentInput && handleFocusToParentInput();
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    >
                      {renderItem(item, index)}
                    </motion.button>
                  ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </ClientOnlyPortal>
    </>
  );
}
