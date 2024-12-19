"use client";

import { useState } from "react";

interface UseHoverResult {
  value: boolean;
  toggle: (value: boolean) => void;
}

const useHover = (initialValue: boolean = false): UseHoverResult => {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = (value: boolean) => {
    setValue(value);
  };

  return { value, toggle };
};

export default useHover;
