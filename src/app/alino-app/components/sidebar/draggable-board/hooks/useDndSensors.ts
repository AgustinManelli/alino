"use client";

import { useMemo, useCallback } from "react";
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

  const adjustForLayoutPadding: Modifier = useCallback(
    ({ transform }) => ({
      ...transform,
      x: transform.x - 15,
      y: transform.y - 15,
    }),
    []
  );

  return { sensors, measuring, adjustForLayoutPadding };
}
