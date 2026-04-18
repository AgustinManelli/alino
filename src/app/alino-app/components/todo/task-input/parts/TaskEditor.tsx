"use client";
import { memo, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import styles from "../task-input.module.css";

const MAX_HEIGHT = 200;

interface TaskEditorProps {
  editor: Editor | null;
  focus: boolean;
}

export const TaskEditor = memo(function TaskEditor({
  editor,
  focus,
}: TaskEditorProps) {
  const inputContainerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={inputContainerRef} className={styles.inputContainer}>
      <div
        className={styles.editorWrapper}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>
    </div>
  );
});
