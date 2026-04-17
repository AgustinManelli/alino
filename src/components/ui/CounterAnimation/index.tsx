"use client";

import { useMemo, memo } from "react";
import NumberFlow from "@number-flow/react";

type CounterAnimationProps = {
  tasksLength?: number;
  format?: boolean;
  isAnimationEnabled?: boolean;
};

export const CounterAnimation = memo(function CounterAnimation({
  tasksLength = 0,
  format = false,
  isAnimationEnabled = true,
}: CounterAnimationProps) {
  const formatOptions = useMemo(
    () => ({
      notation: "compact" as const,
      minimumIntegerDigits: format ? 2 : 1,
      useGrouping: false,
    }),
    [format],
  );

  return (
    <NumberFlow
      value={tasksLength}
      format={formatOptions}
      animated={isAnimationEnabled}
    />
  );
});
