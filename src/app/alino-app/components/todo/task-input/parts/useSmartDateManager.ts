"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!editor) return;
    editor.view.dispatch(
      editor.state.tr.setMeta(
        "smartDateHighlight",
        activeDetected?.text || null,
      ),
    );
  }, [activeDetected, editor]);

  useEffect(() => {
    if (!activeDetected || (!focus && !showBubble)) {
      setBubbleCoords(null);
      return;
    }
    const timer = setTimeout(() => {
      const el = editor?.view.dom.querySelector(".smart-date-highlight");
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect) {
          setBubbleCoords({
            top: rect.top - 45,
            left: rect.left + rect.width / 2,
          });
        }
      } else {
        setBubbleCoords(null);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeDetected, editorText, editor, focus, showBubble, formContainerRef]);

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
