import { useCallback, useState } from "react";

export function useLineCalculator(textRef: React.RefObject<HTMLElement>) {
  const [lines, setLines] = useState<
    { width: number; top: number; left: number }[]
  >([]);

  const calculateLines = useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    requestAnimationFrame(() => {
      try {
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = Array.from(range.getClientRects());
        if (!rects.length) {
          setLines([]);
          return;
        }

        const pRect = el.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        type RectInfo = {
          leftP: number;
          topP: number;
          height: number;
          rightP: number;
          centerYP: number;
        };

        const rectInfos: RectInfo[] = rects
          .filter((r) => r.width > 0 && r.height > 0)
          .map((r) => {
            const leftP = r.left - pRect.left;
            const topP = r.top - pRect.top;
            const height = r.height;
            const rightP = leftP + r.width;
            const centerYP = topP + height / 2;
            return { leftP, topP, height, rightP, centerYP };
          });

        const LINE_MERGE_THRESHOLD = 6;
        const groups: Array<RectInfo[]> = [];
        rectInfos.forEach((ri) => {
          let found = false;
          for (const g of groups) {
            const avgCenter = g.reduce((s, x) => s + x.centerYP, 0) / g.length;
            if (Math.abs(avgCenter - ri.centerYP) <= LINE_MERGE_THRESHOLD) {
              g.push(ri);
              found = true;
              break;
            }
          }
          if (!found) groups.push([ri]);
        });

        const SVG_HEIGHT = 6;
        const SVG_CENTER = SVG_HEIGHT / 2;
        const VERTICAL_ADJUST = 0;

        const newLines = groups.map((g) => {
          const minLeftP = Math.min(...g.map((x) => x.leftP));
          const maxRightP = Math.max(...g.map((x) => x.rightP));
          const avgCenterYP = g.reduce((s, x) => s + x.centerYP, 0) / g.length;
          const width = maxRightP - minLeftP;

          const pOffsetTopInParent = Math.round(pRect.top - parentRect.top);
          const pOffsetLeftInParent = Math.round(pRect.left - parentRect.left);

          const topRelativeToParent = Math.round(
            pOffsetTopInParent + (avgCenterYP - SVG_CENTER + VERTICAL_ADJUST)
          );
          const leftRelativeToParent = Math.round(
            pOffsetLeftInParent + minLeftP
          );

          return {
            left: leftRelativeToParent,
            top: topRelativeToParent,
            width: Math.round(width),
          };
        });

        setLines(newLines);
      } catch {
        setLines([]);
      }
    });
  }, [textRef]);

  return { lines, calculateLines };
}
