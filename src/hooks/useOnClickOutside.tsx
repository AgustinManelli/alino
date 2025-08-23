"use client";

import { useEffect } from "react";

export function useOnClickOutside(
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

    const supportsPointer =
      typeof window !== "undefined" && "PointerEvent" in window;

    if (supportsPointer) {
      document.addEventListener("pointerdown", listener, { capture: true });
    } else {
      document.addEventListener("mousedown", listener, { capture: true });
      document.addEventListener("touchstart", listener, { capture: true });
    }

    return () => {
      if (supportsPointer) {
        document.removeEventListener("pointerdown", listener, {
          capture: true,
        } as EventListenerOptions);
      } else {
        document.removeEventListener("mousedown", listener, {
          capture: true,
        } as EventListenerOptions);
        document.removeEventListener("touchstart", listener, {
          capture: true,
        } as EventListenerOptions);
      }
    };
  }, [ref, parentRef, handler]);
}
