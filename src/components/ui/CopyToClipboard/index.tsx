import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "./CopyToClipboard.module.css";
import { Check, CopyToClipboardIcon } from "../icons/icons";
import { customToast } from "@/lib/toasts";

const COOLDOWN_MS = 2500;

interface CopyToClipboardProps {
  text: string | null;
  successMessage?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  initialBorderStroke?: string;
}

const CopyToClipboard = memo(function CopyToClipboard({
  text,
  successMessage = "Copiado al portapapeles",
  size = 30,
  className,
  style,
  initialBorderStroke = "var(--border-container-color)",
}: CopyToClipboardProps) {
  const [isCooling, setIsCooling] = useState(false);
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number>(undefined);
  const startRef = useRef<number>(undefined);

  const SIZE = size;
  const R = (SIZE * 7) / 30;
  const SW = 1.5;
  const half = SW / 2;
  const w = SIZE - SW;
  const h = SIZE - SW;
  const perimeter = 2 * (w - 2 * R) + 2 * (h - 2 * R) + 2 * Math.PI * R;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!text || isCooling) return;

      navigator.clipboard.writeText(text);
      customToast.success(successMessage);

      setIsCooling(true);
      setProgress(0);
      startRef.current = performance.now();

      const tick = (now: number) => {
        const p = Math.min((now - (startRef.current ?? now)) / COOLDOWN_MS, 1);
        setProgress(p);
        if (p < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setIsCooling(false);
          setProgress(0);
        }
      };
      animRef.current = requestAnimationFrame(tick);
    },
    [text, isCooling, successMessage],
  );

  useEffect(
    () => () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    },
    [],
  );

  const dashOffset = perimeter * progress;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const iconSize = (SIZE * 13) / 30;
  const checkSize = (SIZE * 16) / 30;

  return (
    <motion.button
      disabled={!text || isCooling}
      onClick={handleClick}
      className={`${styles.copyButton} ${className ?? ""}`}
      whileTap={!isCooling ? { scale: 0.9 } : undefined}
      style={{
        stroke: "var(--text-not-available)",
        ...style,
        width: SIZE,
        height: SIZE,
        opacity: !text ? 0.3 : 1,
        cursor: isCooling ? "initial" : "pointer",
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <rect
          x={half}
          y={half}
          width={w}
          height={h}
          rx={R}
          fill="none"
          stroke={initialBorderStroke}
          strokeWidth={SW}
        />
        {isCooling && (
          <rect
            x={half}
            y={half}
            width={w}
            height={h}
            rx={R}
            fill="none"
            stroke="#3fdd00"
            strokeWidth={SW}
            strokeDasharray={perimeter}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
      </svg>

      <div
        style={{
          position: "relative",
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {isCooling ? (
            <motion.div
              key="check"
              initial={{ opacity: 0, scale: 0.3, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.3, rotate: 45 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ position: "absolute", display: "flex" }}
            >
              <Check
                style={{
                  strokeWidth: "2",
                  stroke: "#3fdd00",
                  width: `${checkSize}px`,
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ position: "absolute", display: "flex" }}
            >
              <CopyToClipboardIcon
                style={{
                  strokeWidth: "2",
                  stroke: "inherit",
                  width: `${checkSize}px`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
});

export default CopyToClipboard;
