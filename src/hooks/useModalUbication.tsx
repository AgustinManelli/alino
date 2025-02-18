"use client";

import { useCallback, useEffect } from "react";

export function useModalUbication(
  triggerRef: React.RefObject<HTMLElement>,
  portalRef: React.RefObject<HTMLElement>,
  options: () => void
) {
  const ubication = useCallback(() => {
    if (!triggerRef.current || !portalRef.current) return;
    const parentRect = triggerRef.current!.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    portalRef.current.style.top = `${parentRect.top + scrollY + parentRect.height + 5}px`;
    portalRef.current.style.left = `${parentRect.left}px`;

    if (
      triggerRef.current.getBoundingClientRect().top >
      window.innerHeight / 2
    ) {
      portalRef.current.style.top = `${parentRect.top + scrollY - portalRef.current.offsetHeight - 5}px`;
    }
  }, []);

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
