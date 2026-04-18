"use client";
import { memo } from "react";
import { SmartDateBubble } from "@/components/ui/SmartDateBubble/SmartDateBubble";
import { SmartDateResult } from "@/hooks/useSmartDate";

interface SmartDateBubbleLayerProps {
  activeDetected: SmartDateResult | null;
  showBubble: boolean;
  focus: boolean;
  bubbleCoords: { top: number; left: number } | null;
  onAssign: (date: Date, hour?: string, text?: string) => void;
  onDismiss: () => void;
  setIsHoveringBubble: (v: boolean) => void;
}

export const SmartDateBubbleLayer = memo(function SmartDateBubbleLayer({
  activeDetected,
  showBubble,
  focus,
  bubbleCoords,
  onAssign,
  onDismiss,
  setIsHoveringBubble,
}: SmartDateBubbleLayerProps) {
  if (!activeDetected || !showBubble || !focus || !bubbleCoords) return null;

  return (
    <div
      onMouseEnter={() => setIsHoveringBubble(true)}
      onMouseLeave={() => setIsHoveringBubble(false)}
      style={{
        position: "absolute",
        top: `${bubbleCoords.top}px`,
        left: `${bubbleCoords.left}px`,
        transform: "translateX(-50%)",
        zIndex: 27,
      }}
    >
      <SmartDateBubble
        detected={activeDetected}
        onAssign={(d, h, txt) => onAssign(d, h, txt)}
        onDismiss={onDismiss}
      />
    </div>
  );
});
