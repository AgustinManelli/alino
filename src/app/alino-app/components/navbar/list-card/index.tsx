"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { Database } from "@/lib/schemas/todo-schema";

import { CounterAnimation } from "@/components/ui/counter-animation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ColorPicker } from "@/components/ui/color-picker";
import { MoreConfigs } from "../more-configs";

import { Check, Pin } from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";

interface props {
  list: ListsType;
  setIsCreating: (value: boolean) => void;
  isCreating: boolean;
  handleCloseNavbar: () => void;
  navScrolling: number;
  setAllowCloseNavbar: (value: boolean) => void;
}

export function ListCard({
  list,
  setIsCreating,
  isCreating,
  handleCloseNavbar,
  navScrolling,
  setAllowCloseNavbar,
}: props) {
  //estados locales
  const [isMoreOptions, setIsMoreOptions] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [colorTemp, setColorTemp] = useState<string>(list.color);
  const [emoji, setEmoji] = useState<string | null>(list.icon);
  const [deleteConfirm, isDeleteConfirm] = useState<boolean>(false);
  const [isNameChange, setIsNameChange] = useState<boolean>(false);
  const [input, setInput] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(list.name);
  const [checkHover, setCheckHover] = useState<boolean>(false);
  const [isOpenPicker, setIsOpenPicker] = useState<boolean>(false);

  //estados globales
  const { deleteList, updateDataList, updatePinnedList } = useTodoDataStore();
  const { isMobile } = usePlatformInfoStore();

  //ref's
  const divRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const portalRef = useRef<HTMLInputElement | null>(null);

  //next router
  const pathname = usePathname();
  const router = useRouter();

  //funciones
  const handleSetColor = (color: string, typing?: boolean) => {
    setColorTemp(color);
    if (typing) return;
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  };

  const handleSetEmoji = (emoji: string) => {
    setEmoji(emoji);
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  };

  const handleChangeMoreOptions = (prop: boolean) => {
    //función para abrir el panel de opciones de cada lista
    setIsMoreOptions(prop);
    setAllowCloseNavbar(!prop);
  };

  const handleConfirm = () => {
    //función para abrir el modal de eliminar lista
    isDeleteConfirm(true);
    setAllowCloseNavbar(false);
  };

  const handleDelete = () => {
    //función para eliminar lista
    setAllowCloseNavbar(true);
    setIsMoreOptions(false);
    if (pathname === `/alino-app/${list.id}`) {
      router.push(`${location.origin}/alino-app`);
    }
    deleteList(list.id);
  };

  const handleNameChange = () => {
    //funcion para mostrar funcionalidad de cambiar de nombre
    setIsNameChange(true);
    setIsMoreOptions(false);
    setInput(true);
    setHover(true);
    setAllowCloseNavbar(false);
    setIsCreating(true);
  };

  const handleSaveName = async () => {
    setIsCreating(false);
    setAllowCloseNavbar(true);

    if (
      list.name === inputName &&
      list.color === colorTemp &&
      list.icon === emoji
    ) {
      setInput(false);
      setIsNameChange(false);
      setHover(false);
      return;
    }

    setInput(false);
    setIsNameChange(false);
    setHover(false);

    const { error } = await updateDataList(
      list.id,
      inputName,
      colorTemp,
      emoji
    );

    if (error) {
      setInputName(list.name);
      setColorTemp(list.color);
    }
  };

  const handlePin = () => {
    setIsMoreOptions(false);
    setHover(false);
    setIsCreating(false);
    setAllowCloseNavbar(true);
    updatePinnedList(list.id, !list.pinned);
  };

  //useEffect's
  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [input]);

  useEffect(() => {
    setIsMoreOptions(false);
    setIsOpenPicker(false);
  }, [navScrolling]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        divRef.current &&
        !divRef.current.contains(event.target as Node) &&
        (portalRef.current
          ? !portalRef.current.contains(event.target as Node)
          : true)
      ) {
        setIsNameChange(false);
        setInput(false);
        setIsCreating(false);
        setAllowCloseNavbar(true);
        setInputName(list.name);
        setColorTemp(list.color);
        setEmoji(list.icon);
        setHover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [list.name]);

  //dndkit
  const id = list.id;
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    transition: {
      duration: 500,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
    disabled: isCreating || isMoreOptions || isOpenPicker || list.pinned,
  });

  const style = {
    transform: `translate3d(${transform ? transform.x : "0"}px, ${transform ? transform.y : "0"}px, 0)`,
    transition,
    backgroundColor:
      hover || pathname === `/alino-app/${list.id}` || isMoreOptions
        ? "rgb(250, 250, 250)"
        : "#fff",
    pointerEvents: isDragging ? "none" : "auto",
    zIndex: isDragging ? 99 : 1,
    opacity: isDragging ? 0.2 : 1,
  } as React.CSSProperties;

  return (
    <>
      {deleteConfirm && (
        <ConfirmationModal
          text={`¿Desea eliminar la lista "${list.name}"?`}
          aditionalText="Esta acción es irreversible y eliminará todas las tareas de la lista."
          isDeleteConfirm={isDeleteConfirm}
          handleDelete={handleDelete}
          setAllowCloseNavbar={setAllowCloseNavbar}
        />
      )}
      <div ref={setNodeRef}>
        <div
          className={styles.container}
          onMouseEnter={!isMobile ? () => setHover(true) : undefined}
          onMouseLeave={() => {
            if (!isMobile && !input) setHover(false);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            !isCreating &&
              (router.push(`${location.origin}/alino-app/${list.id}`),
              handleCloseNavbar());
          }}
          style={style}
          {...attributes}
          {...listeners}
          ref={divRef}
        >
          <div
            className={styles.cardFx}
            style={{
              boxShadow:
                pathname === `/alino-app/${list.id}`
                  ? `${colorTemp} 100px 50px 50px`
                  : `initial`,
            }}
          ></div>
          <motion.div className={styles.colorPickerMotion}>
            <ColorPicker
              portalRef={portalRef}
              isOpenPicker={isOpenPicker}
              setIsOpenPicker={setIsOpenPicker}
              color={colorTemp}
              setColor={handleSetColor}
              emoji={emoji}
              setEmoji={handleSetEmoji}
              active={isNameChange ? true : false}
            />
          </motion.div>

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
              initial={{ backgroundPosition: "200% center" }}
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
            <div
              className={styles.pinContainer}
              style={{
                right: isMobile ? "60px" : "35px",
                opacity: isNameChange ? "0" : 1,
              }}
            >
              <Pin
                style={{
                  width: "14px",
                  stroke: "rgb(210, 210, 210)",
                  strokeWidth: "2",
                }}
              />
            </div>
          )}

          {isNameChange ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSaveName();
              }}
              className={styles.checkButton}
              style={{
                backgroundColor: checkHover
                  ? "rgb(240,240,240)"
                  : "transparent",
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
          ) : isMobile ? (
            <div className={styles.containerButtonsMobile}>
              <div className={styles.buttonMobile}>
                <MoreConfigs
                  iconWidth={"23px"}
                  open={isMoreOptions}
                  setOpen={handleChangeMoreOptions}
                  handleDelete={handleConfirm}
                  handleNameChange={handleNameChange}
                  handlePin={handlePin}
                  pinned={list.pinned}
                />
              </div>
              <p className={styles.counterMobile}>
                <CounterAnimation tasksLength={list.tasks?.length} />
              </p>
            </div>
          ) : (
            <>
              <div
                className={styles.button}
                style={{
                  opacity: hover || isMoreOptions ? "1" : "0",
                }}
              >
                <MoreConfigs
                  iconWidth={"23px"}
                  open={isMoreOptions}
                  setOpen={handleChangeMoreOptions}
                  handleDelete={handleConfirm}
                  handleNameChange={handleNameChange}
                  handlePin={handlePin}
                  pinned={list.pinned}
                />
              </div>
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
    </>
  );
}

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];
