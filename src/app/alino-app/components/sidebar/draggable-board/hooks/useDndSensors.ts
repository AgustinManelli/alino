"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import {
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  MeasuringStrategy,
  type Modifier,
} from "@dnd-kit/core";

export function useDndSensors() {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 5, delay: 250, tolerance: 5 },
    })
  );

  const measuring = useMemo(
    () => ({ droppable: { strategy: MeasuringStrategy.Always } }),
    []
  );

  const [padding, setPadding] = useState({ top: 15, left: 15 });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const safeAreaTop = parseInt(style.getPropertyValue('--safe-area-inset-top'), 10) || 0;
    
    const totalTopPadding = safeAreaTop + 15;
    const totalLeftPadding = 15;

    setPadding({ top: totalTopPadding, left: totalLeftPadding });
  }, []);

  const adjustForLayoutPadding: Modifier = useCallback(
    ({ transform }) => ({
      ...transform,
      x: transform.x - padding.left,
      y: transform.y - padding.top,
    }),
    [padding]
  );

  return { sensors, measuring, adjustForLayoutPadding };
}
