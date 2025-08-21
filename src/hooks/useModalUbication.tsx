"use client";

import { useCallback, useEffect } from "react";

export function useModalUbication(
  triggerRef: React.RefObject<HTMLElement>,
  portalRef: React.RefObject<HTMLElement>,
  options: () => void,
  direction: boolean = true
) {
  const ubication = useCallback(() => {
    if (!triggerRef.current || !portalRef.current) return;

    const parentRect = triggerRef.current.getBoundingClientRect();
    const portalRect = portalRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    let top = parentRect.top + scrollY + parentRect.height + 5;

    if (parentRect.top > windowHeight / 2) {
      top = parentRect.top + scrollY - portalRef.current.offsetHeight - 5;
    }

    const fitsBelow =
      parentRect.top + parentRect.height + portalRect.height < windowHeight;
    const fitsAbove = parentRect.top - portalRect.height > 0;

    if (!fitsAbove && !fitsBelow) {
      top = scrollY + (windowHeight - portalRect.height) / 2;

      if (direction) {
        portalRef.current.style.left = `${parentRect.right + 5}px`;
        portalRef.current.style.right = "auto";
      } else {
        portalRef.current.style.right = `${
          windowWidth - parentRect.left + 5
        }px`;
        portalRef.current.style.left = "auto";
      }
    } else {
      portalRef.current.style.top = `${top}px`;
      if (direction) {
        portalRef.current.style.left = `${parentRect.left}px`;
        portalRef.current.style.right = "auto";
      } else {
        portalRef.current.style.right = `${windowWidth - parentRect.right}px`;
        portalRef.current.style.left = "auto";
      }
    }

    portalRef.current.style.top = `${top}px`;
  }, [direction, triggerRef, portalRef]);

  //useEffect's
  useEffect(() => {
    if (!triggerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      ubication();
    });

    const scrollHandler = () => {
      ubication();
    };

    resizeObserver.observe(triggerRef.current);

    window.addEventListener("scroll", scrollHandler, true);
    window.addEventListener("resize", scrollHandler, true);

    ubication();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scrollHandler, true);
      window.removeEventListener("resize", scrollHandler, true);
    };
  }, [ubication]);

  useEffect(function mount() {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (portalRef.current !== null && triggerRef.current !== null) {
        if (
          !portalRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          options();
        }
      }
    }

    window.addEventListener("mousedown", divOnClick);
    window.addEventListener("mouseup", divOnClick);
    ubication();

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
      window.removeEventListener("mouseup", divOnClick);
    };
  });
}
