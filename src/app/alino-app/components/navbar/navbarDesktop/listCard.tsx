"use client";

import { useEffect, useRef, useState } from "react";
import { ColorPicker } from "@/components";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { Check, Pin } from "@/lib/ui/icons";
import styles from "./listCard.module.css";
import { CounterAnimation } from "@/components";
import { redirect, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components";
import MoreConfigs from "../moreConfigs";
import useMobileStore from "@/store/useMobileStore";
import { motion } from "motion/react";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function ListCard({
  list,
  setIsCreating,
  isCreting,
  handleCloseNavbar,
}: {
  list: ListsType;
  setIsCreating: (value: boolean) => void;
  isCreting: boolean;
  handleCloseNavbar: () => void;
}) {
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);
  const updateListName = useLists((state) => state.updateListName);
  const updateListPinned = useLists((state) => state.updateListPinned);
  const isMobile = useMobileStore((state) => state.isMobile);

  const divRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.color);
  const [emoji, setEmoji] = useState<string>(list.icon);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [input, setInput] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(list.name);
  const [checkHover, setCheckHover] = useState<boolean>(false);

  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const handleChangeMoreOptions = (prop: boolean) => {
    setIsMoreOptions(prop);
  };

  const handleConfirm = () => {
    isDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setIsMoreOptions(false);
    if (pathname === `/alino-app/${list.id}`) {
      router.push(`${location.origin}/alino-app`);
    }
    await deleteList(list.id, list.name);
  };

  const handleNameChange = () => {
    setIsNameChange(true);
    setIsMoreOptions(false);
    setInput(true);
    setHover(true);
    setIsCreating(true);
  };

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [input]);

  const handleSave = async () => {
    setIsCreating(false);
    await changeColor(colorTemp, list.id, emoji);
  };

  const handleSaveName = async () => {
    setIsCreating(false);

    if (list.name === inputName) {
      setInput(false);
      setIsNameChange(false);
      setHover(false);
      console.log("pase");
      return;
    }

    setInput(false);
    setIsNameChange(false);
    setHover(false);
    await updateListName(list.id, inputName);
  };

  const handlePin = async () => {
    setIsMoreOptions(false);
    setHover(false);
    await updateListPinned(list.id, !list.pinned);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        divRef.current &&
        !divRef.current.contains(event.target as Node)
      ) {
        setIsNameChange(false);
        setInput(false);
        setIsCreating(false);
        setInputName(list.name);
        setHover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [list.name]);

  return (
    <div ref={divRef}>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${list.name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          isDeleteConfirm={isDeleteConfirm}
          handleDelete={handleDelete}
        />
      )}
      <div
        className={styles.container}
        onMouseEnter={!isMobile ? () => setHover(true) : undefined}
        onMouseLeave={() => {
          if (!isMobile && !input) setHover(false);
        }}
        onClick={() => {
          router.push(`${location.origin}/alino-app/${list.id}`);
          !isCreting && handleCloseNavbar();
        }}
        style={{
          backgroundColor:
            hover || pathname === `/alino-app/${list.id}` || isMoreOptions
              ? "rgb(250, 250, 250)"
              : "#fff",
          pointerEvents: "auto",
        }}
        // href={`/alino-app/${list.id}`}
      >
        <div
          className={styles.cardFx}
          style={{
            boxShadow:
              hover || pathname === `/alino-app/${list.id}` || isMoreOptions
                ? `${colorTemp} 100px 50px 50px`
                : `initial`,
          }}
        ></div>
        {/* <p style={{ position: "absolute", left: "150px", fontSize: "10px" }}>
          {list.index}
        </p> */}
        <div className={styles.identifierContainer}>
          <ColorPicker
            color={colorTemp}
            setColor={setColorTemp}
            save={true}
            handleSave={handleSave}
            width={"20px"}
            originalColor={list.color}
            setEmoji={setEmoji}
            emoji={emoji}
            originalEmoji={list.icon}
            setChoosingColor={setIsCreating}
            choosingColor={isCreting}
          />
        </div>

        {/* IMPLEMENTAR INPUT PARA CAMBIAR DE NOMBRE CON SU RESPECTIVO BOTÓN */}
        {isNameChange ? (
          <div className={styles.nameChangerContainer}>
            <input
              className={styles.nameChangerInput}
              type="text"
              value={inputName}
              ref={inputRef}
              onChange={(e) => {
                setInputName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (!inputRef.current) return;
                if (e.key === "Enter") {
                  handleSaveName();
                }
                if (e.key === "Escape") {
                  setIsNameChange(false);
                  setInput(false);
                  setInputName(list.name);
                }
              }}
            />
          </div>
        ) : (
          // <p className={styles.listName}>{list.name}</p>
          <motion.p
            className={styles.listName}
            style={{
              background: `linear-gradient(to right,#1c1c1c 80%, ${list.color} 90%, transparent 95%) 0% center / 200% no-repeat text`,
              backgroundSize: "200% auto",
              backgroundRepeat: "no-repeat",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            animate={{
              backgroundPosition: ["200% center", "0% center"],
            }}
            transition={{
              duration: 2,
              ease: "linear",
              delay: 0.2,
            }}
          >
            {list.name}
          </motion.p>
        )}
        {list.pinned && (
          <div className={styles.pinContainer}>
            <Pin
              style={{
                width: "14px",
                stroke: "rgb(210, 210, 210)",
                strokeWidth: "2",
              }}
            />
          </div>
        )}
        {input ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveName();
            }}
            className={styles.checkButton}
            style={{
              backgroundColor: checkHover ? "rgb(240,240,240)" : "transparent",
            }}
            onMouseEnter={() => {
              setCheckHover(true);
            }}
            onMouseLeave={() => {
              setCheckHover(false);
            }}
          >
            <Check
              style={{
                stroke: "#1c1c1c",
                strokeWidth: "2",
                width: "20px",
                height: "auto",
              }}
            />
          </button>
        ) : (
          <>
            <button
              className={styles.button}
              style={{
                opacity: hover || isMoreOptions ? "1" : "0",
                display: isMobile ? "none" : "visible",
              }}
            >
              <MoreConfigs
                width={"23px"}
                open={isMoreOptions}
                setOpen={handleChangeMoreOptions}
                handleDelete={handleConfirm}
                handleNameChange={handleNameChange}
                handlePin={handlePin}
                pinned={list.pinned}
              />
            </button>
            <p
              className={styles.counter}
              style={{
                opacity: hover || isMoreOptions ? "0" : "1",
              }}
            >
              <CounterAnimation tasksLength={list.tasks?.length} />
            </p>
          </>
        )}
      </div>
    </div>
  );
}
