"use client";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import ReactDOM from "react-dom";
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
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import type { TaskType } from "@/lib/schemas/database.types";
import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { WavyStrikethrough } from "@/components/ui/WavyStrikethrough";
import {
  isHtmlContent,
  parseRichTextContent,
} from "@/components/ui/RichTextEditor/richTextUtils";
import { FontSizeExtension } from "@/components/ui/RichTextEditor/fontSizeExtension";
import { Check, Note } from "@/components/ui/icons/icons";
import styles from "./task-card.module.css";
import { useUserDataStore } from "@/store/useUserDataStore";
import { ItemTypeDropdown } from "./parts/ItemTypeDropdown";
import { useSmartDate } from "@/hooks/useSmartDate";
import { useSmartDateInteraction } from "@/hooks/useSmartDateInteraction";
import { SmartDateBubble } from "@/components/ui/SmartDateBubble/SmartDateBubble";
import { SmartDateHighlighter } from "@/components/ui/RichTextEditor/SmartDateHighlighter";
import { TASK_CHAR_LIMIT } from "@/config/app-config";

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
  Link.configure({
    openOnClick: false,
    autolink: true,
  }),
  SmartDateHighlighter,
];

function combineDateAndTime(d?: Date, h?: string) {
  if (!d) return null;
  const combined = new Date(d);
  const [hours, minutes] = (h ?? "23:59").split(":").map(Number);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

const uncompletedIconStyle = {
  width: "15px",
  stroke: "var(--icon-colorv2)",
  strokeWidth: "2",
  overflow: "visible",
  transition: "fill 0.1s ease-in-out",
};

const checkPathStyle = {
  stroke: "var(--icon-color-inside)",
  strokeWidth: 2,
};

const noteIconStyle = {
  width: "15px",
  stroke: "var(--icon-colorv2)",
  strokeWidth: "2",
  opacity: "0.2",
};

const userAvatarStyle = {
  width: "30px",
  height: "30px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  opacity: 0.2,
};

const avatarImgStyle = {
  width: "25px",
  height: "25px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  borderRadius: "50%",
};

const checkButtonStyle = {
  width: "100%",
  height: "auto",
  stroke: "var(--icon-color)",
  strokeWidth: 2,
};

export const TaskCard = memo(
  ({
    task,
    onEditorReady,
    maxHeight,
    selected,
    setSelected,
    hour,
    setHour,
  }: {
    task: TaskType;
    onEditorReady?: (editor: Editor) => void;
    maxHeight: number | null;
    selected: Date | undefined;
    setSelected: (d: Date | undefined) => void;
    hour: string | undefined;
    setHour: (h: string | undefined) => void;
  }) => {
    const [completed, setCompleted] = useState<boolean | null>(task.completed);
    const closeModal = useEditTaskModalStore((state) => state.closeModal);
    const modalEditOpen = useEditTaskModalStore((state) => state.isOpen);
    const isModalAnimating = useEditTaskModalStore(
      (state) => state.isAnimating,
    );
    const textRef = useRef<HTMLElement>(null);

    const [editorText, setEditorText] = useState("");
    const [cursorPos, setCursorPos] = useState(-1);
    const [dismissedText, setDismissedText] = useState<string | null>(null);

    const detectedDate = useSmartDate(editorText);
    const activeDetected =
      detectedDate && detectedDate.text !== dismissedText ? detectedDate : null;

    const [bubbleCoords, setBubbleCoords] = useState<{
      top: number;
      left: number;
      fixed: boolean;
    } | null>(null);
    const textContainerRef = useRef<HTMLDivElement>(null);

    const { showBubble, setIsHoveringBubble } = useSmartDateInteraction(
      activeDetected,
      cursorPos,
      textContainerRef,
    );

    const updateTaskName = useTodoDataStore((state) => state.updateTaskName);
    const user = useUserDataStore((state) => state.user);

    const handleSaveRef = useRef<() => Promise<void>>(async () => {});
    const editorRef = useRef<Editor | null>(null);

    const editor = useEditor({
      extensions: RICH_TEXT_EXTENSIONS,
      content: parseRichTextContent(task.task_content),
      immediatelyRender: false,
      editorProps: {
        attributes: { class: styles.proseMirrorCard },
        handleKeyDown: (_view, event) => {
          if (event.key === "Enter") {
            if (event.shiftKey) {
              event.preventDefault();
              editorRef.current?.commands.splitBlock();
              return true;
            } else {
              event.preventDefault();
              handleSaveRef.current();
              return true;
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            editorRef.current?.commands.setContent(
              parseRichTextContent(task.task_content),
            );
            closeModal();
            return true;
          }
          return false;
        },
      },
      onCreate: ({ editor }) => {
        onEditorReady?.(editor);
        setEditorText(editor.getText());
        setTimeout(() => {
          editor.commands.focus("end");
        }, 50);
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
      if (editor) onEditorReady?.(editor);
    }, [editor, onEditorReady]);

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
            if (rect) {
              setBubbleCoords({
                top: rect.top - 44,
                left: rect.left + rect.width / 2,
                fixed: true,
              });
            }
          } else {
            setBubbleCoords(null);
          }
        }, 20);
        return () => clearTimeout(timer);
      } else {
        setBubbleCoords(null);
      }
    }, [activeDetected, editorText, editor, isModalAnimating]);

    useEffect(() => {
      setCompleted(task.completed);
      if (editor) {
        const current = editor.getHTML();
        const next = parseRichTextContent(task.task_content);
        if (current !== next) {
          editor.commands.setContent(next, { emitUpdate: false });
        }
      }
    }, [task.task_content, task.completed, editor]);

    const handleSaveName = useCallback(async () => {
      const ed = editorRef.current;
      if (!ed) return;

      const htmlContent = ed.getHTML();
      const isEmpty = ed.isEmpty;
      const combinedDate = combineDateAndTime(selected, hour);

      closeModal();

      if (
        isEmpty ||
        (task.task_content === htmlContent &&
          task.completed === completed &&
          task.target_date === combinedDate)
      ) {
        if (isEmpty)
          ed.commands.setContent(parseRichTextContent(task.task_content));
        return;
      }

      const { error } = await updateTaskName(
        task.task_id,
        htmlContent,
        completed,
        combinedDate,
      );
      if (error)
        ed.commands.setContent(parseRichTextContent(task.task_content));
    }, [completed, task, updateTaskName, selected, hour, closeModal]);

    useEffect(() => {
      handleSaveRef.current = handleSaveName;
    }, [handleSaveName]);

    const handleSaveClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        handleSaveName();
      },
      [handleSaveName],
    );

    const handleBubbleHoverEnter = useCallback(
      () => setIsHoveringBubble(true),
      [setIsHoveringBubble],
    );
    const handleBubbleHoverLeave = useCallback(
      () => setIsHoveringBubble(false),
      [setIsHoveringBubble],
    );

    const handleBubbleAssign = useCallback(
      (
        d: Date | undefined,
        h: string | undefined,
        txt: string | null | undefined,
      ) => {
        setSelected(d);
        if (h) setHour(h);
        if (editor) editor.commands.focus();
        setDismissedText(txt ?? null);
      },
      [editor, setHour, setSelected],
    );

    const handleBubbleDismiss = useCallback(() => {
      if (activeDetected) setDismissedText(activeDetected.text);
    }, [activeDetected]);

    const isCreatedByOther = user?.user_id !== task.created_by?.user_id;

    return (
      <div
        className={styles.cardContainer}
        style={{
          maxHeight: maxHeight ? `${maxHeight}px` : "initial",
          paddingLeft: modalEditOpen ? "10px" : "15px",
          boxShadow:
            "rgba(12, 20, 66, 0.02) 0px 4px 12px, rgba(12, 20, 66, 0.08) 0px 30px 80px, rgb(230, 233, 237) 0px 0px 0px 0px inset",
        }}
      >
        <div className={styles.checkboxContainer}>
          {!modalEditOpen ? (
            task.completed !== null ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                style={{
                  ...uncompletedIconStyle,
                  fill: task.completed ? "var(--icon-colorv2)" : "transparent",
                }}
              >
                <path d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z" />
                <path
                  style={{
                    ...checkPathStyle,
                    opacity: task.completed ? "1" : "0",
                  }}
                  strokeLinejoin="round"
                  d="m6.68,13.58s1.18,0,2.76,2.76c0,0,3.99-7.22,7.88-8.67"
                />
              </svg>
            ) : (
              <Note style={noteIconStyle} />
            )
          ) : (
            <ItemTypeDropdown
              completed={completed}
              setCompleted={setCompleted}
              inputRef={{ current: null } as any}
            />
          )}
        </div>

        <div
          className={styles.textContainer}
          style={{ position: "relative" }}
          ref={textContainerRef}
        >
          {activeDetected &&
            showBubble &&
            modalEditOpen &&
            bubbleCoords &&
            !isModalAnimating &&
            ReactDOM.createPortal(
              <div
                className="no-close-edit"
                onMouseEnter={handleBubbleHoverEnter}
                onMouseLeave={handleBubbleHoverLeave}
                style={{
                  position: "fixed",
                  top: `${bubbleCoords.top}px`,
                  left: `${bubbleCoords.left}px`,
                  transform: "translateX(-50%)",
                  zIndex: 9999,
                }}
              >
                <SmartDateBubble
                  detected={activeDetected}
                  onAssign={handleBubbleAssign}
                  onDismiss={handleBubbleDismiss}
                />
              </div>,
              document.body,
            )}

          {modalEditOpen ? (
            <div
              className={styles.editorCardWrapper}
              style={{
                maxHeight: maxHeight ? `${maxHeight - 20}px` : "initial",
              }}
            >
              <EditorContent
                editor={editor}
                className={styles.editorCardContent}
              />
            </div>
          ) : (
            <>
              <div
                ref={textRef as React.RefObject<HTMLDivElement>}
                className={styles.text}
                style={{ opacity: completed ? 0.3 : 1 }}
                dangerouslySetInnerHTML={{
                  __html: isHtmlContent(task.task_content)
                    ? task.task_content
                    : `<p>${task.task_content}</p>`,
                }}
              />
              <WavyStrikethrough
                textRef={textRef as any}
                completed={completed}
              />
            </>
          )}
        </div>

        {isCreatedByOther && (
          <div style={userAvatarStyle}>
            <div
              style={{
                ...avatarImgStyle,
                backgroundImage: `url(${task.created_by?.avatar_url})`,
              }}
            />
          </div>
        )}

        <div className={styles.editingButtons}>
          <TimeLimitBox
            target_date={task.target_date}
            idScrollArea="task-section-scroll-area"
            completed={completed}
          />
          {modalEditOpen && (
            <button onClick={handleSaveClick} className={styles.checkButton}>
              <Check style={checkButtonStyle} />
            </button>
          )}
        </div>
      </div>
    );
  },
);
