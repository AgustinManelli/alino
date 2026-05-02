"use client";
import { useEffect, useLayoutEffect, useCallback } from "react";

export function useModalBoxUbication(
  triggerRef: React.RefObject<HTMLElement>,
  modalRef: React.RefObject<HTMLElement>,
  onClose: () => void
) {
  const position = useCallback(() => {
    const trigger = triggerRef.current;
    const modal = modalRef.current;
    if (!trigger || !modal) return;

    const triggerRect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 5;

    const top =
      triggerRect.bottom + gap + modal.offsetHeight > vh
        ? triggerRect.top - modal.offsetHeight - gap
        : triggerRect.bottom + gap;
    modal.style.top = `${top}px`;

    modal.style.left = "auto";
    modal.style.right = `${vw - triggerRect.right}px`;

    const modalRect = modal.getBoundingClientRect();
    const spaceLeft = modalRect.left;
    const spaceRight = vw - modalRect.right;

    if (spaceRight > spaceLeft) {
      modal.style.right = "auto";
      modal.style.left = `${Math.max(gap, (vw - modal.offsetWidth) / 2)}px`;
    }
  }, [triggerRef, modalRef]);

  useLayoutEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const observer = new ResizeObserver(() => position());
    observer.observe(modal);
    position();

    return () => observer.disconnect();
  }, [position, modalRef]);

  useEffect(() => {
    window.addEventListener("resize", position, true);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position, true);
      window.removeEventListener("scroll", position, true);
    };
  }, [position]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !modalRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [onClose, modalRef, triggerRef]);
}