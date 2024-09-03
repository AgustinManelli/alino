"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/components";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";
import { Check, DeleteIcon, MoreVertical } from "@/lib/ui/icons";
import styles from "./listCard.module.css";
import { CounterAnimation } from "@/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components";
import MoreConfigs from "../moreConfigs";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function ListCard({ list }: { list: ListsType }) {
  const deleteList = useLists((state) => state.deleteList);
  const changeColor = useLists((state) => state.changeColor);
  const updateListName = useLists((state) => state.updateListName);

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
    await deleteList(list.id, list.name);
    if (pathname === `/alino-app/${list.id}`) {
      router.push(`${location.origin}/alino-app`);
    }
  };

  const handleNameChange = () => {
    setIsNameChange(true);
    setIsMoreOptions(false);
    setInput(true);
    setHover(true);
  };

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [input]);

  const handleSave = async () => {
    await changeColor(colorTemp, list.id, emoji);
  };

  const handleSaveName = async () => {
    if (list.name === inputName) {
      setInput(false);
      setIsNameChange(false);
      return;
    }
    await updateListName(list.id, inputName);
    setInput(false);
    setIsNameChange(false);
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
        setInputName(list.name);
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
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          !input && setHover(false);
        }}
        onClick={() => {
          router.push(`${location.origin}/alino-app/${list.id}`);
        }}
        style={{
          backgroundColor:
            hover || pathname === `/alino-app/${list.id}` || isMoreOptions
              ? "rgb(250, 250, 250)"
              : "transparent",
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
        <div className={styles.identifierContainer}>
          <ColorPicker
            color={colorTemp}
            originalColor={list.color}
            setColor={setColorTemp}
            save={true}
            handleSave={handleSave}
            width={"20px"}
            setEmoji={setEmoji}
            emoji={emoji}
            originalEmoji={list.icon}
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
            />
          </div>
        ) : (
          <p className={styles.listName}>{list.name}</p>
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
              }}
            >
              <MoreConfigs
                width={"25px"}
                open={isMoreOptions}
                setOpen={handleChangeMoreOptions}
                handleDelete={handleConfirm}
                handleNameChange={handleNameChange}
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
