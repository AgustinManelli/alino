"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import { FontSizeExtension } from "@/components/ui/RichTextEditor/fontSizeExtension";
import { SmartDateHighlighter } from "@/components/ui/RichTextEditor/SmartDateHighlighter";
import { TASK_CHAR_LIMIT } from "@/config/app-config";
import styles from "../task-input.module.css";

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

interface UseTaskEditorSetupOptions {
  setFocus: (v: boolean) => void;
  onSubmit: () => void;
  onEditorUpdate: (text: string, cursorPos: number) => void;
}

export function useTaskEditorSetup({
  setFocus,
  onSubmit,
  onEditorUpdate,
}: UseTaskEditorSetupOptions) {
  const editorRef = useRef<Editor | null>(null);
  // Stable refs so keyboard handlers never go stale
  const onSubmitRef = useRef(onSubmit);
  const setFocusRef = useRef(setFocus);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);
  useEffect(() => {
    setFocusRef.current = setFocus;
  }, [setFocus]);

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
            onSubmitRef.current();
            return true;
          }
        }
        if (event.key === "Escape") {
          event.preventDefault();
          editorRef.current?.commands.clearContent();
          (editorRef.current?.view.dom as HTMLElement | undefined)?.blur();
          setFocusRef.current(false);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onEditorUpdate(editor.getText(), editor.state.selection.from);
    },
    onSelectionUpdate: ({ editor }) => {
      onEditorUpdate(editor.getText(), editor.state.selection.from);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const clearEditor = useCallback(() => {
    editorRef.current?.commands.clearContent();
  }, []);

  const focusEditor = useCallback(() => {
    editorRef.current?.commands.focus();
  }, []);

  // Explicitly removes DOM focus from ProseMirror so the editor
  // can no longer capture keystrokes when the input is dismissed.
  const blurEditor = useCallback(() => {
    const dom = editorRef.current?.view.dom;
    if (dom) (dom as HTMLElement).blur();
  }, []);

  return { editor, editorRef, clearEditor, focusEditor, blurEditor };
}
