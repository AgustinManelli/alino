"use client";
import { useLayoutEffect, useCallback, useEffect, useRef, RefObject } from "react";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

export function useSidebarItemTooltip(
  triggerRef: RefObject<HTMLElement>,
  tooltipRef: RefObject<HTMLElement>,
  visible: boolean
) {
  const sidebarPosition = useUserPreferencesStore((state) => state.sidebarPosition);
  const rafRef = useRef<number | null>(null);
  const lastPosRef = useRef<{ top: string; left: string; right: string }>({
    top: "",
    left: "",
    right: "",
  });

  const position = useCallback(() => {
    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const gap = 8;

    let top = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
    top = Math.max(gap, Math.min(top, vh - tooltipHeight - gap));
    const newTop = `${top}px`;
    let newLeft = "auto";
    let newRight = "auto";

    if (sidebarPosition === "right") {
      newRight = `${vw - triggerRect.left + gap}px`;
    } else {
      newLeft = `${triggerRect.right + gap}px`;
    }

    const last = lastPosRef.current;
    if (last.top !== newTop) {
      tooltip.style.top = newTop;
      last.top = newTop;
    }
    if (last.left !== newLeft) {
      tooltip.style.left = newLeft;
      last.left = newLeft;
    }
    if (last.right !== newRight) {
      tooltip.style.right = newRight;
      last.right = newRight;
    }
  }, [triggerRef, tooltipRef, sidebarPosition]);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    const observer = new ResizeObserver(() => position());
    observer.observe(tooltip);
    position();

    return () => observer.disconnect();
  }, [position, tooltipRef]);

  useEffect(() => {
    window.addEventListener("resize", position, true);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position, true);
      window.removeEventListener("scroll", position, true);
    };
  }, [position]);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const loop = () => {
      position();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [visible, position]);
}
