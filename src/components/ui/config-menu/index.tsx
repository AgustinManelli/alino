"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MoreVertical } from "@/components/ui/icons/icons";
import styles from "./ConfigMenu.module.css";
import { ConfigCard } from "./config-card";

interface ConfigOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

interface props {
  iconWidth: string;
  configOptions: ConfigOption[];
  children?: React.ReactNode;
}

export function ConfigMenu({ iconWidth, configOptions, children }: props) {
  const [open, setOpen] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);

  const Ref = useRef<HTMLDivElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  useEffect(function mount() {
    ubication();
    function ubication() {
      if (!Ref.current || !sRef.current) return;
      const parentRect = Ref.current!.getBoundingClientRect();
      const sRect = sRef.current!.getBoundingClientRect();

      sRef.current.style.top = `${parentRect.top + parentRect.width + 10}px`;
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

    const scrollContainer = document.getElementById("task-section-scroll-area");
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
            backgroundColor: hover || open ? "rgb(240,240,240)" : "transparent",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          <MoreVertical
            style={{ stroke: "#1c1c1c", width: "20px", strokeWidth: "3" }}
          />
        </button>
      </div>
      {createPortal(
        <>
          {open ? (
            <section
              ref={sRef}
              className={styles.container}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
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
          ) : (
            ""
          )}
        </>,
        document.body
        // document.getElementById("app") as HTMLElement
      )}
    </>
  );
}
