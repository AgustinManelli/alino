"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
  CharacterCount.configure({ limit: 1000 }),
  Link.configure({
    openOnClick: false,
    autolink: true,
  }),
  SmartDateHighlighter,
];
export default function TaskInput({ setList }: { setList?: ListsType }) {
  const lists = useTodoDataStore((state) => state.lists);
  const addTask = useTodoDataStore((state) => state.addTask);

  const [focus, setFocus] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [isNote, setIsNote] = useState(false);
  const [height, setHeight] = useState("40px");
  const [isScrollable, setIsScrollable] = useState(false);
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

  const { showBubble, setIsHoveringBubble } = useSmartDateInteraction(
    activeDetected,
    cursorPos,
    formContainerRef,
  );

  const texts = [
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
  const [currentText, setCurrentText] = useState(
    () => texts[Math.floor(Math.random() * texts.length)],
  );

  useEffect(() => {
    setCurrentText(texts[Math.floor(Math.random() * texts.length)]);
    const interval = setInterval(() => {
      setCurrentText((prev) => {
        const idx = texts.indexOf(prev);
        return texts[(idx + 1) % texts.length];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [focus]);

  const executedRef = useRef(false);
  useEffect(() => {
    executedRef.current = true;
    if (
      (lists.length > 0 && !selectedListHome) ||
      (lists.length > 0 &&
        !lists.find((l) => l.list_id === selectedListHome?.list_id))
    ) {
      setSelectedListHome(lists[0]);
    } else if (selectedListHome) {
      setSelectedListHome(
        lists[lists.findIndex((l) => l.list_id === selectedListHome.list_id)],
      );
    }
  }, [lists]);

  const handleAddRef = useRef<() => void>(() => {});
  const setFocusRef = useRef(setFocus);
  const setHeightRef = useRef(setHeight);
  const setScrollableRef = useRef(setIsScrollable);

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
          setHeightRef.current("40px");
          setScrollableRef.current(false);
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
            const calculatedTop = rect.top - containerRect.top - 40;
            const calculatedLeft =
              rect.left - containerRect.left + rect.width / 2;
            setBubbleCoords({
              top: calculatedTop,
              left: calculatedLeft,
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

  const editorRef = useRef(editor);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor || !focus) return;
    const el = editor.view.dom as HTMLElement;

    const update = () => {
      const h = el.offsetHeight + 13;
      const clamped = Math.min(h, MAX_HEIGHT);
      setHeight(clamped + "px");
      setIsScrollable(h > MAX_HEIGHT);
    };

    const timer = setTimeout(() => {
      update();
      const observer = new ResizeObserver(update);
      observer.observe(el);
      (update as any)._observer = observer;
    }, 16);

    return () => {
      clearTimeout(timer);
      ((update as any)._observer as ResizeObserver | undefined)?.disconnect();
    };
  }, [editor, focus]);

  function combineDateAndTime(d?: Date, h?: string) {
    if (!d) return null;
    const combined = new Date(d);
    const [hours, minutes] = (h ?? "23:59").split(":").map(Number);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
  }

  const handleAdd = useCallback(() => {
    const ed = editorRef.current;
    if (!ed || ed.isEmpty) {
      ed?.commands.clearContent();
      setSelected(undefined);
      setHour(undefined);
      setFocus(false);
      setHeight("40px");
      setIsScrollable(false);
      return;
    }
    const html = ed.getHTML();
    const combinedDate = combineDateAndTime(selected, hour);
    ed.commands.clearContent();
    setSelected(undefined);
    setHour(undefined);
    setFocus(false);
    setHeight("40px");
    setIsScrollable(false);
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

  useEffect(() => {
    if (focus && editor) {
      const t = setTimeout(() => editor.commands.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [focus, editor]);

  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => {
    const calendarEl = document.getElementById("calendar-component");
    const dropdownEl = document.getElementById("dropdown-component");
    if (calendarEl || dropdownEl) return;
    if (editor && !editor.isEmpty) return;
    setFocus(false);
    editor?.commands.clearContent();
    setHour(undefined);
    setSelected(undefined);
    setHeight("40px");
    setIsScrollable(false);
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
                if (editor) {
                  editor.commands.focus();
                }
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
              key="type-dropdown"
              initial={{ scale: 0 }}
              animate={{ scale: focus ? 1 : 0 }}
              exit={{ scale: 0 }}
            >
              <ItemTypeDropdown
                isNote={isNote}
                setIsNote={setIsNote}
                inputRef={{ current: null } as any}
              />
            </motion.div>
          </div>

          <motion.div
            className={styles.inputContainer}
            initial={{ height: 40 }}
            animate={{ height }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              overflowY: isScrollable ? "auto" : "hidden",
              marginTop: focus ? "17px" : "0",
            }}
          >
            <div
              className={styles.editorWrapper}
              style={{ display: focus ? "flex" : "none" }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <EditorContent editor={editor} className={styles.editorContent} />
            </div>
          </motion.div>

          {!focus && (
            <div className={styles.placeholder}>
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
            </div>
          )}

          <div className={styles.inputManagerContainer}>
            <AnimatePresence mode="popLayout">
              {isHome && (
                <motion.div
                  key="list-selector"
                  initial={{ scale: 0 }}
                  animate={{ scale: focus ? 1 : 0 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
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

              {!isNote && (
                <motion.div
                  key="calendar"
                  initial={{ scale: 0 }}
                  animate={{ scale: focus ? 1 : 0 }}
                  exit={{ scale: 0 }}
                  transition={{ delay: 0.05 }}
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

              <motion.div
                key="sep"
                initial={{ height: 0 }}
                animate={{ height: focus ? 30 : 0 }}
                exit={{ height: 0 }}
                style={{
                  width: "1px",
                  backgroundColor: "var(--icon-color)",
                  opacity: 0.2,
                }}
              />

              <motion.button
                key="send"
                className={styles.taskSendButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd();
                }}
                initial={{ scale: 0 }}
                animate={{ scale: focus ? 1 : 0 }}
                exit={{ scale: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SendIcon
                  style={{
                    width: "20px",
                    height: "auto",
                    stroke: "var(--icon-color)",
                    strokeWidth: 1.5,
                  }}
                />
              </motion.button>
            </AnimatePresence>
          </div>

          {charCount > 0 && (
            <p
              className={styles.limitIndicator}
              style={{
                color:
                  charCount > 900
                    ? "#fc0303"
                    : charCount > 800
                      ? "#fc8003"
                      : charCount > 700
                        ? "#ffb300"
                        : "#8a8a8a",
              }}
            >
              {charCount}/1000
            </p>
          )}
        </div>

        <div
          className={styles.toolbarWrapper}
          onClick={(e) => e.stopPropagation()}
        >
          <RichTextToolbar editor={editor} visible={focus} />
        </div>
      </div>
    </section>
  );
}
