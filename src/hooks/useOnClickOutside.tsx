"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export const useOnClickOutside = (
  refElement: React.RefObject<HTMLElement>,
  callback: (e: MouseEvent | TouchEvent) => void,
  excludes: React.RefObject<HTMLElement>[] = [],
  ignoreClass: string | null | undefined = null
) => {
  const savedHandler = useRef(callback);

  useLayoutEffect(() => {
    savedHandler.current = callback;
  }, [callback]);

  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (
        !refElement.current ||
        refElement.current.contains(e.target as Node)
      ) {
        return;
      }
      if (
        excludes?.some((exclude) => exclude.current?.contains(e.target as Node))
      ) {
        return;
      }
      if (ignoreClass && (e.target as Element).closest(`.${ignoreClass}`)) {
        return;
      }
      savedHandler.current(e);
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
  }, [refElement, excludes]);
};
