import { RefObject, useCallback, useState } from "react";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import {
  hexColorSchema,
  shortcodeEmojiSchema,
} from "@/lib/schemas/list/validation";

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

  const { insertList, insertFolder } = useTodoDataStore(
    useShallow((state) => ({
      insertList: state.insertList,
      insertFolder: state.insertFolder,
    }))
  );

  const resetForm = useCallback(() => {
    setActiveInput(false);
    setInputValue("");
    setColor(DEFAULT_COLOR);
    setEmoji(null);
    setIsList(true);
  }, []);

  const handleSetColor = useCallback(
    (newColor: string | null, isTyping?: boolean) => {
      setColor(newColor);

      if (emoji && isTyping) {
        setEmoji(null);
      }

      if (isTyping) {
        return;
      }

      const validation = hexColorSchema.safeParse(newColor);
      if (!validation.success) {
        setColor(isList ? DEFAULT_COLOR : DEFAULT_FOLDER_COLOR);
        if (emoji) setEmoji(null);
        toast.error(validation.error.issues[0].message);
      }
      inputRef.current?.focus();
    },
    [emoji, isList]
  );

  const handleSetEmoji = useCallback((newEmoji: string | null) => {
    const validation = shortcodeEmojiSchema.safeParse(newEmoji);
    if (!validation.success) {
      setEmoji(null);
      toast.error(validation.error.issues[0].message);
    } else {
      setEmoji(newEmoji);
    }
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const formatText = inputValue.replace(/\s+/g, " ").trim();

    if (formatText.length < 1) {
      resetForm();
      return;
    }

    isList && color
      ? insertList(formatText, color, emoji as string)
      : insertFolder(formatText, color);

    const scrollElement = document.getElementById("list-container");
    if (scrollElement) {
      setTimeout(() => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
    resetForm();
  }, [inputValue, color, emoji, insertList, insertFolder, resetForm, isList]);

  return {
    color,
    emoji,
    isList,
    inputValue,
    handleSetColor,
    handleSetEmoji,
    setIsList,
    setInputValue,
    resetForm,
    handleSubmit,
  };
};
