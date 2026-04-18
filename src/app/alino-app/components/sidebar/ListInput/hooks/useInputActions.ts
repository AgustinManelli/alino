"use client";

import { RefObject, useCallback, useState } from "react";
import { useInsertList } from "@/hooks/todo/lists/useInsertList";
import { useInsertFolder } from "@/hooks/todo/folders/useInsertFolder";
import { hexColorSchema, shortcodeEmojiSchema } from "@/lib/schemas/list/validation";
import { customToast } from "@/lib/toasts";

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
      if (isTyping) {
        setColor(newColor);
        setEmoji((prev) => (prev !== null ? null : prev));
        return;
      }

      const validation = hexColorSchema.safeParse(newColor);
      if (!validation.success) {
        setColor(isList ? DEFAULT_COLOR : DEFAULT_FOLDER_COLOR);
        setEmoji((prev) => (prev !== null ? null : prev));
        customToast.error(validation.error.issues[0].message);
        return;
      }
      
      setColor(newColor);
      inputRef.current?.focus();
    },
    [isList, DEFAULT_COLOR, DEFAULT_FOLDER_COLOR, inputRef]
  );

  const handleSetEmoji = useCallback(
    (newEmoji: string | null) => {
      const validation = shortcodeEmojiSchema.safeParse(newEmoji);
      if (!validation.success) {
        setEmoji(null);
        customToast.error(validation.error.issues[0].message);
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

    const colorValidation = hexColorSchema.safeParse(color);
    const finalColor = colorValidation.success ? color : (isList ? DEFAULT_COLOR : DEFAULT_FOLDER_COLOR);

    if (isList) {
      insertList(formatText, finalColor ?? DEFAULT_COLOR, emoji as string);
    } else {
      insertFolder(formatText, finalColor);
    }

    const scrollElement = document.getElementById("list-container");
    if (scrollElement) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth",
          });
        });
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