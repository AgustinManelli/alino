"use client";

import React, { useMemo } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getWidgetCompanion } from "@/config/widgetRegistry";

export const CompanionOverlayHost = () => {
  const widgetInstances = useDashboardStore((state) => state.widgetInstances);

  const activeCompanions = useMemo(() => {
    return widgetInstances
      .filter((inst) => inst.isInstalled && inst.pwIsActive !== false)
      .map((inst) => {
        const key = inst.componentKey ?? inst.widgetKey;
        const Companion = getWidgetCompanion(key);
        if (!Companion) return null;
        return {
          id: inst.widgetKey,
          instanceId: inst.instanceId,
          Component: Companion,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [widgetInstances]);

  if (activeCompanions.length === 0) {
    return null;
  }

  return (
    <>
      {activeCompanions.map(({ id, instanceId, Component }) => (
        <Component key={id} instanceId={instanceId} />
      ))}
    </>
  );
};
