"use client";

import React, { useEffect } from "react";

function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  parentRef: React.RefObject<HTMLElement>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) {
        console.log(parentRef);
        return;
      }
      if (parentRef.current !== null) {
        console.log(parentRef.current);
        if (
          !parentRef.current ||
          parentRef.current.contains(e.target as Node)
        ) {
          console.log(parentRef);
          return;
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
