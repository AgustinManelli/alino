"use client";

import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { Database } from "@/lib/schemas/todo-schema";
import { hexColorSchema } from "@/lib/schemas/validationSchemas";

import { CounterAnimation } from "@/components/ui/counter-animation";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ColorPicker } from "@/components/ui/color-picker";
import { MoreConfigs } from "../more-configs";

import { Check, Pin } from "@/components/ui/icons/icons";
import styles from "./ListCard.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useUIStore } from "@/store/useUIStore";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

const arePropsEqual = (prevProps: props, nextProps: props) => {
  return (
    prevProps.list.id === nextProps.list.id &&
    prevProps.list.name === nextProps.list.name &&
    prevProps.list.color === nextProps.list.color &&
    prevProps.list.icon === nextProps.list.icon &&
    prevProps.list.pinned === nextProps.list.pinned &&
    prevProps.handleCloseNavbar === nextProps.handleCloseNavbar
  );
};

interface props {
  list: ListsType;
  handleCloseNavbar: () => void;
}

export const ListCard = memo(({ list, handleCloseNavbar }: props) => {
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
  const isMobile = usePlatformInfoStore((state) => state.isMobile);
  const animations = useUserPreferencesStore((state) => state.animations);
  const setAllowCloseNavbar = useUIStore((state) => state.setAllowCloseNavbar);
  const isCreating = useUIStore((state) => state.isCreating);
  const setIsCreating = useUIStore((state) => state.setIsCreating);

  const taskCount = useTodoDataStore(
    useCallback((state) => state.getTaskCountByListId(list.id), [list.id])
  );

  //ref's
  const divRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const portalRef = useRef<HTMLInputElement | null>(null);

  //next router
  const pathname = usePathname();
  const router = useRouter();

  //funciones
  const isActiveList = useMemo(
    () => pathname === `/alino-app/${list.id}`,
    [pathname, list.id]
  );

  const gradientStyle = useMemo(
    () => ({
      background: `linear-gradient(to right,#1c1c1c 80%, ${list.color} 90%, transparent 95%) 0% center / 200% no-repeat text`,
      backgroundSize: "200% auto" as const,
      backgroundRepeat: "no-repeat" as const,
      WebkitBackgroundClip: "text" as const,
      WebkitTextFillColor: "transparent" as const,
      backgroundClip: "text" as const,
    }),
    [list.color]
  );

  const handleSetColor = useCallback(
    (color: string, typing?: boolean) => {
      setColorTemp(color);

      if (emoji && typing) setEmoji(null);

      if (typing) return;

      const validation = hexColorSchema.safeParse(color);

      if (!validation.success) {
        setColorTemp(list.color);
        if (emoji) {
          setEmoji(list.icon);
        }
      }

      inputRef.current?.focus();
    },
    [emoji, list.color, list.icon]
  );

  const setOriginalColor = useCallback(() => {
    setColorTemp(list.color);
    setEmoji(list.icon);
  }, [list.color, list.icon]);

  const handleSetEmoji = useCallback((newEmoji: string | null) => {
    setEmoji(newEmoji);
    inputRef.current?.focus();
  }, []);

  const handleChangeMoreOptions = useCallback(
    (prop: boolean) => {
      setIsMoreOptions(prop);
      setAllowCloseNavbar(!prop);
    },
    [setAllowCloseNavbar]
  );

  const handleConfirm = useCallback(() => {
    isDeleteConfirm(true);
    setAllowCloseNavbar(false);
  }, [setAllowCloseNavbar]);

  const handleDelete = useCallback(() => {
    setAllowCloseNavbar(true);
    setIsMoreOptions(false);
    if (isActiveList) router.push(`${location.origin}/alino-app`);
    deleteList(list.id);
  }, [isActiveList, list.id, deleteList, setAllowCloseNavbar, router]);

  const handleNameChange = useCallback(() => {
    setIsNameChange(true);
    setIsMoreOptions(false);
    setHover(true);
    setAllowCloseNavbar(false);
    setIsCreating(true);
  }, [setIsCreating, setAllowCloseNavbar]);

  const handleSaveName = useCallback(async () => {
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
      setEmoji(list.icon);
    }
  }, [
    list,
    inputName,
    colorTemp,
    emoji,
    updateDataList,
    setIsCreating,
    setAllowCloseNavbar,
  ]);

  const handlePin = useCallback(() => {
    setIsMoreOptions(false);
    setHover(false);
    setIsCreating(false);
    setAllowCloseNavbar(true);
    updatePinnedList(list.id, !list.pinned);
  }, [list.pinned, updatePinnedList, setAllowCloseNavbar, setIsCreating]);

  //useEffect's
  useEffect(() => {
    inputRef.current?.focus();
  }, [isNameChange]);

  useEffect(() => {
    const handleScroll = () => {
      setIsMoreOptions(false);
      setIsOpenPicker(false);
    };

    const scrollContainer = document.getElementById("listContainer");
    scrollContainer?.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
  }, [list]);

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

  const style = useMemo(
    () => ({
      transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
      transition,
      backgroundColor:
        hover || isActiveList || isMoreOptions ? "rgb(250, 250, 250)" : "#fff",
      pointerEvents: isDragging ? "none" : "auto",
      zIndex: isDragging ? 99 : 1,
      opacity: isDragging ? 0.2 : 1,
    }),
    [transform, transition, hover, isActiveList, isMoreOptions, isDragging]
  ) as CSSProperties;

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
        <section
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

          <div className={styles.colorPickerContainer}>
            <ColorPicker
              portalRef={portalRef}
              isOpenPicker={isOpenPicker}
              setIsOpenPicker={setIsOpenPicker}
              color={colorTemp}
              setColor={handleSetColor}
              emoji={emoji}
              setEmoji={handleSetEmoji}
              active={isNameChange ? true : false}
              setOriginalColor={setOriginalColor}
            />
          </div>

          {/* IMPLEMENTAR INPUT PARA CAMBIAR DE NOMBRE CON SU RESPECTIVO BOTÓN */}
          <div className={styles.textContainer}>
            {isNameChange ? (
              <motion.input
                initial={
                  animations ? { backgroundColor: "#00000000" } : undefined
                }
                animate={
                  animations ? { backgroundColor: "#0000000d" } : undefined
                }
                transition={{
                  backgroundColor: {
                    duration: 0.3,
                  },
                }}
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
            ) : (
              <motion.p
                className={styles.listName}
                style={gradientStyle}
                initial={
                  animations ? { backgroundPosition: "200% center" } : undefined
                }
                animate={
                  animations
                    ? {
                        backgroundPosition: ["200% center", "0% center"],
                      }
                    : undefined
                }
                transition={{
                  duration: 2,
                  ease: "linear",
                  delay: 0.2,
                }}
              >
                {list.name}
              </motion.p>
            )}
          </div>

          <div className={styles.listManagerContainer}>
            {list.pinned && (
              <div className={styles.pinContainer}>
                <Pin
                  style={{
                    width: "100%",
                    height: "auto",
                    stroke: "rgb(210, 210, 210)",
                    strokeWidth: 2,
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
                onMouseEnter={() => {
                  setCheckHover(true);
                }}
                onMouseLeave={() => {
                  setCheckHover(false);
                }}
              >
                <Check
                  style={{
                    width: "100%",
                    height: "auto",
                    stroke: "#1c1c1c",
                    strokeWidth: 2,
                  }}
                />
              </button>
            ) : isMobile ? (
              <>
                <div className={styles.configsContainer}>
                  <div
                    className={`${styles.configButtonContainer} ${styles.Mobile}`}
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
                </div>
                <div className={styles.configsContainer}>
                  <p className={`${styles.counter} ${styles.Mobile}`}>
                    <CounterAnimation tasksLength={taskCount} />
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.configsContainer}>
                <div
                  className={`${styles.configButtonContainer} ${styles.Desktop}`}
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
                  className={`${styles.counter} ${styles.Desktop}`}
                  style={{
                    opacity: hover || isMoreOptions ? "0" : "1",
                  }}
                >
                  {animations ? (
                    <CounterAnimation tasksLength={taskCount} />
                  ) : (
                    taskCount
                  )}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}, arePropsEqual);
