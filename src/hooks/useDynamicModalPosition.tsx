import { useLayoutEffect } from "react";
import type { RefObject } from "react";

interface UseDynamicPositionArgs {
  anchorRef: RefObject<HTMLButtonElement>;
  contentRef: RefObject<HTMLDivElement>;
  isOpen: boolean;
  gap?: number;
  align?: "left" | "right";
}

export function useDynamicModalPosition({
  anchorRef,
  contentRef,
  isOpen,
  gap = 8,
  align = "right",
}: UseDynamicPositionArgs) {
  useLayoutEffect(() => {
    const calculatePosition = () => {
      if (!isOpen || !anchorRef.current || !contentRef.current) {
        return;
      }

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const { innerHeight: viewHeight, innerWidth: viewWidth } = window;

      let top, left;

      const hasSpaceBelow =
        anchorRect.bottom + contentRect.height + gap < viewHeight;
      const hasSpaceAbove = anchorRect.top - contentRect.height - gap > 0;

      if (hasSpaceBelow || hasSpaceAbove) {
        // Posicionamiento vertical
        top = hasSpaceBelow
          ? anchorRect.bottom + gap
          : anchorRect.top - contentRect.height - gap;

        // Posicionamiento horizontal
        if (align === "left") {
          // Alinear a la izquierda del anchor
          left = anchorRect.left;

          // Si se sale por la derecha, ajustar
          if (left + contentRect.width > viewWidth) {
            left = viewWidth - contentRect.width - gap;
          }

          // Si se sale por la izquierda, ajustar
          if (left < gap) {
            left = gap;
          }
        } else {
          left = anchorRect.right - contentRect.width;

          if (left < gap) {
            left = gap;
          }

          if (left + contentRect.width > viewWidth) {
            left = viewWidth - contentRect.width - gap;
          }
        }
      } else {
        top = anchorRect.top + anchorRect.height / 2 - contentRect.height / 2;
        top = Math.max(
          gap,
          Math.min(top, viewHeight - contentRect.height - gap)
        );

        if (align === "left") {
          if (anchorRect.right + contentRect.width + gap < viewWidth) {
            left = anchorRect.right + gap;
          } else {
            left = anchorRect.left - contentRect.width - gap;
          }
        } else {
          if (anchorRect.left - contentRect.width - gap > 0) {
            left = anchorRect.left - contentRect.width - gap;
          } else {
            left = anchorRect.right + gap;
          }
        }

        left = Math.max(
          gap,
          Math.min(left, viewWidth - contentRect.width - gap)
        );
      }

      contentRef.current.style.position = "fixed";
      contentRef.current.style.top = `${top}px`;
      contentRef.current.style.left = `${left}px`;
      contentRef.current.style.zIndex = "9999";
    };

    if (!isOpen || !contentRef.current) return;

    calculatePosition();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(calculatePosition);
    });

    observer.observe(contentRef.current);

    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isOpen, anchorRef, contentRef, gap, align]);
}
