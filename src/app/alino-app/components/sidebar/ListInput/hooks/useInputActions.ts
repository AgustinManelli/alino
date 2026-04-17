"use client";

import { RefObject, useCallback, useState } from "react";
import { toast } from "sonner";
import { useInsertList } from "@/hooks/todo/lists/useInsertList";
import { useInsertFolder } from "@/hooks/todo/folders/useInsertFolder";
import { hexColorSchema, shortcodeEmojiSchema } from "@/lib/schemas/list/validation";

interface Props {
  inputRef: RefObject<HTMLInputElement | null>;
  setActiveInput: (value: boolean) => void;
  DEFAULT_COLOR: string;
  DEFAULT_FOLDER_COLOR: null;
}

export const useInputActions = ({
  inputRef,
  setActiveInput,
  DEFAULT_COLOR,
  DEFAULT_FOLDER_COLOR,
}: Props) => {
  const [color, setColor] = useState<string | null>(DEFAULT_COLOR);
  const [emoji, setEmoji] = useState<string | null>(null);
  const [isList, setIsList] = useState<boolean>(true);
  const [inputValue, setInputValue] = useState<string>("");

  const { insertList } = useInsertList();
  const { insertFolder } = useInsertFolder();

  const resetForm = useCallback(() => {
    setActiveInput(false);
    setInputValue("");
    setColor(DEFAULT_COLOR);
    setEmoji(null);
    setIsList(true);
  }, [setActiveInput, DEFAULT_COLOR]);

  const handleToggleType = useCallback((newListType: boolean) => {
    setIsList(newListType);
    
    if (newListType && color === null) {
      setColor(DEFAULT_COLOR);
    } else if (!newListType) {
      setColor(DEFAULT_FOLDER_COLOR);
    }

    setTimeout(() => inputRef.current?.focus(), 10);
  }, [color, DEFAULT_COLOR, DEFAULT_FOLDER_COLOR, inputRef]);

  const handleSetColor = useCallback(
    (newColor: string | null, isTyping?: boolean) => {
      setColor(newColor);

      if (isTyping) {
        setEmoji((prev) => (prev !== null ? null : prev));
        return;
      }

      const validation = hexColorSchema.safeParse(newColor);
      if (!validation.success) {
        setColor(isList ? DEFAULT_COLOR : DEFAULT_FOLDER_COLOR);
        setEmoji((prev) => (prev !== null ? null : prev));
        toast.error(validation.error.issues[0].message);
      }
      inputRef.current?.focus();
    },
    [isList, DEFAULT_COLOR, DEFAULT_FOLDER_COLOR, inputRef]
  );

  const handleSetEmoji = useCallback(
    (newEmoji: string | null) => {
      const validation = shortcodeEmojiSchema.safeParse(newEmoji);
      if (!validation.success) {
        setEmoji(null);
        toast.error(validation.error.issues[0].message);
      } else {
        setEmoji(newEmoji);
      }
      inputRef.current?.focus();
    },
    [inputRef]
  );

  const handleSubmit = useCallback(() => {
    const formatText = inputValue.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      resetForm();
      return;
    }

    if (isList) {
      insertList(formatText, color ?? DEFAULT_COLOR, emoji as string);
    } else {
      insertFolder(formatText, color);
    }

    const scrollElement = document.getElementById("list-container");
    if (scrollElement) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth",
          });
        }, 50);
      });
    }
    resetForm();
  }, [inputValue, color, emoji, insertList, insertFolder, resetForm, isList, DEFAULT_COLOR]);

  return {
    color,
    emoji,
    isList,
    inputValue,
    handleSetColor,
    handleSetEmoji,
    handleToggleType,
    setInputValue,
    resetForm,
    handleSubmit,
  };
};