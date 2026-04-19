"use client";

import { useEffect, useRef } from "react";
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
import { parseRichTextContent } from "@/components/ui/RichTextEditor/richTextUtils";
import { TASK_CHAR_LIMIT } from "@/config/app-config";

import styles from "../TaskCard.module.css";

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

interface UseInlineEditorProps {
  initialContent: string;
  onUpdate: (text: string, pos: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onFocusToggle?: (isFocused: boolean) => void;
}

export function useInlineEditor({
  initialContent,
  onUpdate,
  onSave,
  onCancel,
  onFocusToggle,
}: UseInlineEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const onSaveRef = useRef(onSave);
  const onCancelRef = useRef(onCancel);
  const onFocusToggleRef = useRef(onFocusToggle);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);
  useEffect(() => {
    onFocusToggleRef.current = onFocusToggle;
  }, [onFocusToggle]);

  const editor = useEditor({
    extensions: RICH_TEXT_EXTENSIONS,
    content: parseRichTextContent(initialContent),
    immediatelyRender: false,
    editorProps: {
      attributes: { class: styles.proseMirrorCard },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onSaveRef.current();
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          onCancelRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getText(), editor.state.selection.from);
    },
    onSelectionUpdate: ({ editor }) => {
      onUpdate(editor.getText(), editor.state.selection.from);
    },
    onFocus: () => {
      onFocusToggleRef.current?.(true);
    },
    onBlur: () => {
      onFocusToggleRef.current?.(true);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return { editor, editorRef };
}
