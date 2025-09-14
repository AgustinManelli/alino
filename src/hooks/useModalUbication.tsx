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
    const gap = 10;

    let top = parentRect.top + scrollY + parentRect.height + gap;

    if (parentRect.top > windowHeight / 2) {
      top = parentRect.top + scrollY - portalRef.current.offsetHeight - gap;
    }

    const fitsBelow =
      parentRect.top + parentRect.height + portalRect.height < windowHeight;
    const fitsAbove = parentRect.top - portalRect.height > 0;

    if (!fitsAbove && !fitsBelow) {
      top = scrollY + (windowHeight - portalRect.height) / 2;

      if (direction) {
        portalRef.current.style.left = `${parentRect.right + gap}px`;
        portalRef.current.style.right = "auto";
      } else {
        portalRef.current.style.right = `${windowWidth - parentRect.left + gap}px`;
        portalRef.current.style.left = "auto";
      }
    } else {
      const fitsLeft = direction
        ? parentRect.left + portalRect.width <= windowWidth
        : parentRect.right - portalRect.width >= 0;

      if (fitsLeft) {
        if (direction) {
          portalRef.current.style.left = `${parentRect.left}px`;
          portalRef.current.style.right = "auto";
        } else {
          portalRef.current.style.right = `${windowWidth - parentRect.right}px`;
          portalRef.current.style.left = "auto";
        }
      } else {
        const triggerCenterX = parentRect.left + parentRect.width / 2;
        const portalHalfWidth = portalRect.width / 2;
        const leftPosition = triggerCenterX - portalHalfWidth;

        const finalLeft = Math.max(
          gap,
          Math.min(leftPosition, windowWidth - portalRect.width - gap)
        );

        portalRef.current.style.left = `${finalLeft}px`;
        portalRef.current.style.right = "auto";
      }
    }

    portalRef.current.style.top = `${top}px`;
  }, [direction, triggerRef, portalRef]);

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

// "use client";

// import { useCallback, useEffect } from "react";

// export function useModalUbication(
//   triggerRef: React.RefObject<HTMLElement>,
//   portalRef: React.RefObject<HTMLElement>,
//   options: () => void,
//   direction: boolean = true
// ) {
//   const ubication = useCallback(() => {
//     if (!triggerRef.current || !portalRef.current) return;

//     const parentRect = triggerRef.current.getBoundingClientRect();
//     const portalRect = portalRef.current.getBoundingClientRect();
//     const windowWidth = window.innerWidth;
//     const windowHeight = window.innerHeight;
//     const scrollY = window.scrollY || document.documentElement.scrollTop;
//     const gap = 10;

//     let top = parentRect.top + scrollY + parentRect.height + gap;

//     if (parentRect.top > windowHeight / 2) {
//       top = parentRect.top + scrollY - portalRef.current.offsetHeight - gap;
//     }

//     const fitsBelow =
//       parentRect.top + parentRect.height + portalRect.height < windowHeight;
//     const fitsAbove = parentRect.top - portalRect.height > 0;

//     if (!fitsAbove && !fitsBelow) {
//       top = scrollY + (windowHeight - portalRect.height) / 2;

//       if (direction) {
//         portalRef.current.style.left = `${parentRect.right + gap}px`;
//         portalRef.current.style.right = "auto";
//       } else {
//         portalRef.current.style.right = `${
//           windowWidth - parentRect.left + gap
//         }px`;
//         portalRef.current.style.left = "auto";
//       }
//     } else {
//       portalRef.current.style.top = `${top}px`;
//       if (direction) {
//         portalRef.current.style.left = `${parentRect.left}px`;
//         portalRef.current.style.right = "auto";
//       } else {
//         portalRef.current.style.right = `${windowWidth - parentRect.right}px`;
//         portalRef.current.style.left = "auto";
//       }
//     }

//     portalRef.current.style.top = `${top}px`;
//   }, [direction, triggerRef, portalRef]);

//   //useEffect's
//   useEffect(() => {
//     if (!triggerRef.current) return;

//     const resizeObserver = new ResizeObserver(() => {
//       ubication();
//     });

//     const scrollHandler = () => {
//       ubication();
//     };

//     resizeObserver.observe(triggerRef.current);

//     window.addEventListener("scroll", scrollHandler, true);
//     window.addEventListener("resize", scrollHandler, true);

//     ubication();

//     return () => {
//       resizeObserver.disconnect();
//       window.removeEventListener("scroll", scrollHandler, true);
//       window.removeEventListener("resize", scrollHandler, true);
//     };
//   }, [ubication]);

//   useEffect(function mount() {
//     function divOnClick(event: MouseEvent | TouchEvent) {
//       if (portalRef.current !== null && triggerRef.current !== null) {
//         if (
//           !portalRef.current.contains(event.target as Node) &&
//           !triggerRef.current.contains(event.target as Node)
//         ) {
//           options();
//         }
//       }
//     }

//     window.addEventListener("mousedown", divOnClick);
//     window.addEventListener("mouseup", divOnClick);
//     ubication();

//     return function unMount() {
//       window.removeEventListener("mousedown", divOnClick);
//       window.removeEventListener("mouseup", divOnClick);
//     };
//   });
// }
