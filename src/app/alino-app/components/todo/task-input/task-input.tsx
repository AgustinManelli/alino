"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-input.module.css";
import { ListsType } from "@/lib/schemas/database.types";
import { Calendar } from "@/components/ui/Calendar";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SendIcon } from "@/components/ui/icons/icons";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { TextAnimation } from "@/components/ui/text-animation";
import { ItemTypeDropdown } from "./parts/ItemTypeDropdown";
import { ListSelectorDropdown } from "./parts/ListSelectorDropdown";
import { FontSizeExtension } from "@/components/ui/RichTextEditor/fontSizeExtension";
import { RichTextToolbar } from "@/components/ui/RichTextEditor/RichTextToolbar";
import { useSmartDate } from "@/hooks/useSmartDate";
import { useSmartDateInteraction } from "@/hooks/useSmartDateInteraction";
import { SmartDateBubble } from "@/components/ui/SmartDateBubble/SmartDateBubble";
import { SmartDateHighlighter } from "@/components/ui/RichTextEditor/SmartDateHighlighter";
import { AIEnhanceButton } from "@/components/ui/AIEnhanceButton/AIEnhanceButton";
import { TASK_CHAR_LIMIT } from "@/config/app-config";

const MAX_HEIGHT = 200;

const RICH_TEXT_EXTENSIONS = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
  }),
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  FontFamily,
  FontSizeExtension,
  TextAlign.configure({ types: ["paragraph"] }),
  CharacterCount.configure({ limit: TASK_CHAR_LIMIT }),
  Link.configure({ openOnClick: false, autolink: true }),
  SmartDateHighlighter,
];

const PLACEHOLDER_TEXTS = [
  "Planificar las vacaciones 🏖️",
  "Sacar a pasear al perro 🐶❣️",
  "Estudiar para el examen",
  "Ponerme al día con los estudios",
  "Pagar las facturas de servicios 💸",
  "Lavar la ropa 🫧",
  "Hacer la compra semanal",
  "Regar las plantas 🪴",
  "Organizar mi semana escolar",
  "Entregar trabajo",
];

const ITEM_SPRING = { type: "spring", stiffness: 500, damping: 28 } as const;

function combineDateAndTime(d?: Date, h?: string): string | null {
  if (!d) return null;
  const combined = new Date(d);
  const [hours, minutes] = (h ?? "23:59").split(":").map(Number);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export default function TaskInput({ setList }: { setList?: ListsType }) {
  const lists = useTodoDataStore((state) => state.lists);
  const addTask = useTodoDataStore((state) => state.addTask);
  const addTasks = useTodoDataStore((state) => state.addTasks);
  const [focus, setFocus] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [isNote, setIsNote] = useState(false);
  const [selectedListHome, setSelectedListHome] = useState<
    ListsType | undefined
  >(lists[0]);
  const [editorText, setEditorText] = useState("");
  const [cursorPos, setCursorPos] = useState(-1);
  const [dismissedText, setDismissedText] = useState<string | null>(null);

  const detectedDate = useSmartDate(editorText);
  const activeDetected =
    detectedDate && detectedDate.text !== dismissedText ? detectedDate : null;
  const [bubbleCoords, setBubbleCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const handleAddRef = useRef<() => void>(() => {});
  const setFocusRef = useRef(setFocus);
  const editorRef = useRef<Editor | null>(null);

  const { showBubble, setIsHoveringBubble } = useSmartDateInteraction(
    activeDetected,
    cursorPos,
    formContainerRef,
  );

  const [currentText, setCurrentText] = useState(
    () =>
      PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)],
  );

  useEffect(() => {
    if (focus) return;
    setCurrentText(
      PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)],
    );
    const interval = setInterval(() => {
      setCurrentText((prev) => {
        const idx = PLACEHOLDER_TEXTS.indexOf(prev);
        return PLACEHOLDER_TEXTS[(idx + 1) % PLACEHOLDER_TEXTS.length];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [focus]);

  useEffect(() => {
    if (lists.length === 0) return;
    if (
      !selectedListHome ||
      !lists.some((l) => l.list_id === selectedListHome.list_id)
    ) {
      setSelectedListHome(lists[0]);
    } else {
      const updatedList = lists.find(
        (l) => l.list_id === selectedListHome.list_id,
      );
      if (updatedList && updatedList !== selectedListHome)
        setSelectedListHome(updatedList);
    }
  }, [lists, selectedListHome]);

  const editor = useEditor({
    extensions: RICH_TEXT_EXTENSIONS,
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: styles.proseMirror },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter") {
          if (event.shiftKey) {
            event.preventDefault();
            editorRef.current?.commands.splitBlock();
            return true;
          } else {
            event.preventDefault();
            handleAddRef.current();
            return true;
          }
        }
        if (event.key === "Escape") {
          event.preventDefault();
          editorRef.current?.commands.clearContent();
          setFocusRef.current(false);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setEditorText(editor.getText());
      setCursorPos(editor.state.selection.from);
    },
    onSelectionUpdate: ({ editor }) => {
      setCursorPos(editor.state.selection.from);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    const container = inputContainerRef.current;
    if (!container || !editor) return;

    if (!focus) {
      container.style.height = "0px";
      container.style.marginTop = "0px";
      container.style.overflowY = "hidden";
      return;
    }

    container.style.marginTop = "17px";

    const el = editor.view.dom as HTMLElement;

    const update = () => {
      const rawH = el.scrollHeight;
      const clamped = Math.min(rawH + 13, MAX_HEIGHT);
      container.style.height = `${clamped}px`;
      container.style.overflowY = rawH + 13 > MAX_HEIGHT ? "auto" : "hidden";
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [editor, focus]);

  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(
      editor.state.tr.setMeta(
        "smartDateHighlight",
        activeDetected?.text || null,
      ),
    );
    if (activeDetected) {
      const timer = setTimeout(() => {
        const el = editor.view.dom.querySelector(".smart-date-highlight");
        if (el) {
          const rect = el.getBoundingClientRect();
          const containerRect =
            formContainerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setBubbleCoords({
              top: rect.top - containerRect.top - 45,
              left: rect.left - containerRect.left + rect.width / 2,
            });
          }
        } else {
          setBubbleCoords(null);
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setBubbleCoords(null);
    }
  }, [activeDetected, editorText, editor]);

  useEffect(() => {
    if (focus && editor) {
      const t = setTimeout(() => editor.commands.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [focus, editor]);

  const handleAdd = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || ed.isEmpty) {
      ed?.commands.clearContent();
      setSelected(undefined);
      setHour(undefined);
      setFocus(false);
      return;
    }
    const html = ed.getHTML();
    const combinedDate = combineDateAndTime(selected, hour);
    ed.commands.clearContent();
    setSelected(undefined);
    setHour(undefined);
    setFocus(false);
    setEditorText("");
    setDismissedText(null);
    if (setList) {
      addTask(setList.list_id, html, combinedDate, isNote);
    } else {
      if (!selectedListHome) return;
      addTask(selectedListHome.list_id, html, combinedDate, isNote);
    }
  }, [selected, hour, isNote, setList, selectedListHome, addTask]);

  useEffect(() => {
    handleAddRef.current = handleAdd;
  }, [handleAdd]);

  useOnClickOutside(containerRef, (e: MouseEvent | TouchEvent) => {
    const target = e.target as Element | null;
    const isInsideClickablePortal = target?.closest(
      "#calendar-component, #dropdown-component, #ai-enhance-panel, .smart-date-bubble-container, [data-tippy-root], .tippy-box, [data-radix-popper-content-wrapper]",
    );
    if (isInsideClickablePortal) return;
    if (editor && !editor.isEmpty) return;
    setFocus(false);
    editor?.commands.clearContent();
    setHour(undefined);
    setSelected(undefined);
    setEditorText("");
    setDismissedText(null);
  });

  const pathname = usePathname();
  const isHome = pathname === "/alino-app";
  const charCount = editor?.storage?.characterCount?.characters?.() ?? 0;

  return (
    <section
      className={styles.container}
      ref={containerRef}
      onClick={() => setFocus(true)}
      style={{ cursor: "text" }}
    >
      <div
        className={styles.formContainer}
        style={{ position: "relative" }}
        ref={formContainerRef}
      >
        {activeDetected && showBubble && focus && bubbleCoords && (
          <div
            onMouseEnter={() => setIsHoveringBubble(true)}
            onMouseLeave={() => setIsHoveringBubble(false)}
            style={{
              position: "absolute",
              top: `${bubbleCoords.top}px`,
              left: `${bubbleCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 27,
            }}
          >
            <SmartDateBubble
              detected={activeDetected}
              onAssign={(d, h, txt) => {
                setSelected(d);
                if (h) setHour(h);
                editor?.commands.focus();
                setDismissedText(txt ?? null);
              }}
              onDismiss={() => {
                if (activeDetected) setDismissedText(activeDetected.text);
              }}
            />
          </div>
        )}

        <div className={styles.form}>
          <div
            className={styles.inputManagerContainer}
            style={{ marginTop: "12.5px" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: focus ? 1 : 0, opacity: focus ? 1 : 0 }}
              transition={ITEM_SPRING}
            >
              <ItemTypeDropdown
                isNote={isNote}
                setIsNote={setIsNote}
                inputRef={{ current: null } as any}
              />
            </motion.div>
          </div>

          <div ref={inputContainerRef} className={styles.inputContainer}>
            <div
              className={styles.editorWrapper}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <EditorContent editor={editor} className={styles.editorContent} />
            </div>
          </div>

          <AnimatePresence>
            {!focus && (
              <motion.div
                className={styles.placeholder}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  mass: 0.6,
                  opacity: { duration: 0.18 },
                  filter: { duration: 0.2 },
                }}
              >
                <TextAnimation
                  style={{
                    fontSize: "14px",
                    height: "17px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  text={currentText}
                  textColor="var(--placeholder-text-color)"
                  opacity={0.3}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.inputManagerContainer}>
            <AnimatePresence>
              {isHome && (
                <motion.div
                  key="list-selector"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: focus ? 1 : 0.6, opacity: focus ? 1 : 0 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={ITEM_SPRING}
                  layout
                >
                  <ListSelectorDropdown
                    lists={lists}
                    selectedList={selectedListHome}
                    setSelectedList={setSelectedListHome}
                    inputRef={{ current: null } as any}
                  />
                </motion.div>
              )}
              {focus && (
                <motion.div
                  key="calendar"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: focus ? 1 : 0.6, opacity: focus ? 1 : 0 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ ...ITEM_SPRING, delay: 0.04 }}
                  layout
                >
                  <Calendar
                    selected={selected}
                    setSelected={setSelected}
                    hour={hour}
                    setHour={setHour}
                    focusToParentInput={() => editor?.commands.focus()}
                  />
                </motion.div>
              )}
              <AnimatePresence>
                {focus && (
                  <motion.div
                    key="ai-btn"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ ...ITEM_SPRING, delay: 0.08 }}
                    layout
                  >
                    <AIEnhanceButton
                      editor={editor}
                      visible
                      onCreateTasks={async (tasks) => {
                        const listId = setList
                          ? setList.list_id
                          : selectedListHome?.list_id;

                        if (!listId)
                          return { error: "No se seleccionó ninguna lista." };

                        try {
                          await addTasks(
                            tasks.map((t) => ({
                              list_id: listId,
                              task_content: `<p>${t.text}</p>`,
                              target_date: t.target_date,
                              note: t.type === "note",
                            })),
                          );

                          return { error: null };
                        } catch (err: any) {
                          return {
                            error:
                              err.message ||
                              "Ocurrió un error al crear las tareas.",
                          };
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                key="sep"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: focus ? 30 : 0, opacity: focus ? 0.2 : 0 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{
                  width: "1px",
                  backgroundColor: "var(--icon-color)",
                  flexShrink: 0,
                }}
              />
              {focus && (
                <motion.button
                  key="send"
                  className={styles.taskSendButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAdd();
                  }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ ...ITEM_SPRING, delay: 0.12 }}
                >
                  <SendIcon className={styles.sendIcon} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {focus && (
            <motion.div
              className={styles.toolbarWrapper}
              initial={{ scale: 0.9, opacity: 0, y: 10, height: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0, height: "auto" }}
              exit={{ scale: 0.9, opacity: 0, y: 10, height: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                height: { duration: 0.1, ease: "linear" },
              }}
              style={{ overflow: "visible" }}
              onClick={(e) => e.stopPropagation()}
            >
              <RichTextToolbar editor={editor} />
            </motion.div>
          )}
        </AnimatePresence>

        {charCount > 0 && (
          <p
            className={styles.limitIndicator}
            style={{
              color:
                charCount > TASK_CHAR_LIMIT * 0.9
                  ? "#fc0303"
                  : charCount > TASK_CHAR_LIMIT * 0.8
                    ? "#fc8003"
                    : charCount > TASK_CHAR_LIMIT * 0.7
                      ? "#ffb300"
                      : "#8a8a8a",
            }}
          >
            {charCount}/{TASK_CHAR_LIMIT}
          </p>
        )}
      </div>
    </section>
  );
}
