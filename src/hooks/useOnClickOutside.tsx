"use client";

import React, { useEffect } from "react";

function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (e: MouseEvent | TouchEvent) => void,
  parentRef?: React.RefObject<HTMLElement>
) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) {
        return;
      }
      if (parentRef) {
        if (parentRef.current !== null) {
          if (
            !parentRef.current ||
            parentRef.current.contains(e.target as Node)
          ) {
            return;
          }
        }
      }
      handler(e);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, parentRef, handler]);
}

export default useOnClickOutside;
