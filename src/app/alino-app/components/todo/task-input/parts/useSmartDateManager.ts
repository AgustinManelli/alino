"use client";
import { useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { useSmartDate } from "@/hooks/useSmartDate";
import { useSmartDateInteraction } from "@/hooks/useSmartDateInteraction";

interface BubbleCoords {
  top: number;
  left: number;
}

interface UseSmartDateManagerOptions {
  editorText: string;
  cursorPos: number;
  editor: Editor | null;
  focus: boolean;
  formContainerRef: React.RefObject<HTMLDivElement>;
}

export function useSmartDateManager({
  editorText,
  cursorPos,
  editor,
  focus,
  formContainerRef,
}: UseSmartDateManagerOptions) {
  const [dismissedText, setDismissedText] = useState<string | null>(null);
  const [bubbleCoords, setBubbleCoords] = useState<BubbleCoords | null>(null);

  const detectedDate = useSmartDate(editorText);
  const activeDetected =
    detectedDate && detectedDate.text !== dismissedText ? detectedDate : null;

  const { showBubble, setIsHoveringBubble } = useSmartDateInteraction(
    activeDetected,
    cursorPos,
    formContainerRef,
  );

  // Sync the smart-date highlight decoration into the editor
  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(
      editor.state.tr.setMeta(
        "smartDateHighlight",
        activeDetected?.text || null,
      ),
    );
  }, [activeDetected, editor]);

  // Calculate bubble position relative to the form container
  useEffect(() => {
    if (!activeDetected || !focus) {
      setBubbleCoords(null);
      return;
    }
    const timer = setTimeout(() => {
      const el = editor?.view.dom.querySelector(".smart-date-highlight");
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerRect = formContainerRef.current?.getBoundingClientRect();
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
  }, [activeDetected, editorText, editor, focus, formContainerRef]);

  // Reset dismissed text when editor content is fully cleared
  useEffect(() => {
    if (editorText === "") setDismissedText(null);
  }, [editorText]);

  return {
    activeDetected,
    showBubble,
    bubbleCoords,
    setIsHoveringBubble,
    dismissedText,
    setDismissedText,
  };
}
