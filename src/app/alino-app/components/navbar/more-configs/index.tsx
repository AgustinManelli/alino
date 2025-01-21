"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { OptionCard } from "./option-card";

import { DeleteIcon, Edit, MoreVertical, Pin, Unpin } from "@/lib/ui/icons";
import styles from "./MoreConfigs.module.css";

interface props {
  iconWidth: string;
  open: boolean;
  setOpen: (prop: boolean) => void;
  handleDelete: () => void;
  handleNameChange: () => void;
  handlePin: () => void;
  pinned: boolean;
}

export function MoreConfigs({
  iconWidth,
  open,
  setOpen,
  handleDelete,
  handleNameChange,
  handlePin,
  pinned,
}: props) {
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
                <OptionCard
                  name={"Editar"}
                  icon={
                    <Edit
                      style={{
                        width: "14px",
                        stroke: "#1c1c1c",
                        strokeWidth: "2",
                      }}
                    />
                  }
                  action={handleNameChange}
                />
                <OptionCard
                  name={pinned ? "Desfijar" : "Fijar"}
                  icon={
                    pinned ? (
                      <Unpin
                        style={{
                          width: "14px",
                          stroke: "#1c1c1c",
                          strokeWidth: "2",
                        }}
                      />
                    ) : (
                      <Pin
                        style={{
                          width: "14px",
                          stroke: "#1c1c1c",
                          strokeWidth: "2",
                        }}
                      />
                    )
                  }
                  action={handlePin}
                />
                <OptionCard
                  name={"Eliminar"}
                  icon={
                    <DeleteIcon
                      style={{
                        width: "14px",
                        stroke: "#1c1c1c",
                        strokeWidth: "2",
                      }}
                    />
                  }
                  action={handleDelete}
                  hoverColor={"#ffe7e6"}
                />
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
