"use client";
import { memo } from "react";
import { SmartDateResult } from "@/hooks/useSmartDate";
import { SmartDateBubble } from "@/components/ui/SmartDateBubble/SmartDateBubble";
import { ClientOnlyPortal } from "@/components/ui/ClientOnlyPortal";

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
    <ClientOnlyPortal>
      <div
        className="smart-date-bubble-container"
        onMouseEnter={() => setIsHoveringBubble(true)}
        onMouseLeave={() => setIsHoveringBubble(false)}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "fixed",
          top: `${bubbleCoords.top}px`,
          left: `${bubbleCoords.left}px`,
          transform: "translateX(-50%)",
          zIndex: 9999,
        }}
      >
        <SmartDateBubble
          detected={activeDetected}
          onAssign={(d, h, txt) => onAssign(d, h, txt)}
          onDismiss={onDismiss}
        />
      </div>
    </ClientOnlyPortal>
  );
});
