import { useState, useEffect, RefObject } from "react";

export function useSmartDateInteraction(
  activeDetected: any,
  cursorPos: number,
  containerRef: RefObject<HTMLElement | null>,
  timeoutMs: number = 3000
) {
  const [isAutoVisible, setIsAutoVisible] = useState(false);
  const [isHoveringHighlight, setIsHoveringHighlight] = useState(false);
  const [isHoveringBubble, setIsHoveringBubble] = useState(false);

  const index = activeDetected?.index ?? -1;
  const length = activeDetected?.text?.length ?? 0;
  const isCursorNearDate = activeDetected && cursorPos >= index && cursorPos <= index + length + 1;

  useEffect(() => {
    if (activeDetected) {
      if (isCursorNearDate) {
        setIsAutoVisible(true);
      } else {
        const timer = setTimeout(() => {
          setIsAutoVisible(false);
        }, timeoutMs);
        return () => clearTimeout(timer);
      }
    } else {
      setIsAutoVisible(false);
      setIsHoveringHighlight(false);
      setIsHoveringBubble(false);
    }
  }, [activeDetected?.text, isCursorNearDate, timeoutMs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let hoverOutTimer: NodeJS.Timeout;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains("smart-date-highlight")) {
        clearTimeout(hoverOutTimer);
        setIsHoveringHighlight(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains("smart-date-highlight")) {
        hoverOutTimer = setTimeout(() => {
          setIsHoveringHighlight(false);
        }, 300);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains("smart-date-highlight")) {
        setIsAutoVisible(true);
        setTimeout(() => setIsAutoVisible(false), timeoutMs);
      }
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
      container.removeEventListener("click", handleClick);
      clearTimeout(hoverOutTimer);
    };
  }, [containerRef, timeoutMs]);

  const showBubble = isAutoVisible || isHoveringHighlight || isHoveringBubble;

  return { showBubble, setIsHoveringBubble };
}
