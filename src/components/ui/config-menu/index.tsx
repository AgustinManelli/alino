"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MoreVertical } from "@/components/ui/icons/icons";
import styles from "./ConfigMenu.module.css";
import { ConfigCard } from "./config-card";
import ClientOnlyPortal from "../client-only-portal";

interface ConfigOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

interface props {
  iconWidth: string;
  configOptions: ConfigOption[];
  optionalState?: (value: boolean) => void;
  idScrollArea?: string;
  uniqueId?: string;
}

export function ConfigMenu({
  iconWidth,
  configOptions,
  optionalState,
  idScrollArea,
  uniqueId = "",
}: props) {
  const [open, setOpen] = useState<boolean>(false);

  const Ref = useRef<HTMLDivElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    ubication();
    function ubication() {
      if (!Ref.current || !sRef.current) return;
      const parentRect = Ref.current!.getBoundingClientRect();
      const sRect = sRef.current!.getBoundingClientRect();

      sRef.current.style.top = `${parentRect.top + parentRect.width + 5}px`;
      sRef.current.style.left = `${parentRect.right - sRect.width}px`;

      if (Ref.current.getBoundingClientRect().top > window.innerHeight / 2) {
        sRef.current.style.top = `${parentRect.top - sRef.current.offsetHeight - 10}px`;
      }
    }
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (sRef.current !== null && Ref.current !== null) {
        if (
          !sRef.current.contains(event.target as Node) &&
          !Ref.current.contains(event.target as Node)
        ) {
          //functions
          setOpen(false);
          optionalState && optionalState(false);
        }
      }
    }
    window.addEventListener("mousedown", divOnClick);
    window.addEventListener("mouseup", divOnClick);

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
      window.removeEventListener("mouseup", divOnClick);
    };
  });

  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
    };
    const scrollContainer = document.getElementById(`${idScrollArea}`);
    scrollContainer?.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className={styles.fit} ref={Ref}>
        <button
          className={styles.mainButton}
          style={{
            width: `${iconWidth}`,
            height: `${iconWidth}`,
            backgroundColor: open
              ? "var(--background-over-container-hover)"
              : " var(--background-over-container)",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
            optionalState && optionalState(!open);
          }}
        >
          <MoreVertical
            style={{
              stroke: "var(--text)",
              width: "20px",
              strokeWidth: "3",
              display: "flex",
            }}
          />
        </button>
      </div>
      <ClientOnlyPortal>
        {open && (
          <section
            ref={sRef}
            className={styles.container}
            id={`config-menu-container-${uniqueId}`}
          >
            <section className={styles.optionsContainer}>
              {configOptions.map((option, index) => (
                <ConfigCard
                  key={index}
                  name={option.name}
                  icon={option.icon}
                  action={() => {
                    option.action();
                    setOpen(false);
                  }}
                />
              ))}
            </section>
          </section>
        )}
      </ClientOnlyPortal>
    </>
  );
}
