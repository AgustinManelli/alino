"use client";

import { useMemo, memo } from "react";
import NumberFlow from "@number-flow/react";

type CounterAnimationProps = {
  value?: number;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
  format?: boolean;
  isAnimationEnabled?: boolean;
  /** @deprecated use `value` */
  tasksLength?: number;
};

export const CounterAnimation = memo(function CounterAnimation({
  value,
  count,
  tasksLength,
  className,
  style,
  format = false,
  isAnimationEnabled = true,
}: CounterAnimationProps) {
  const finalValue = value ?? count ?? tasksLength ?? 0;

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
      value={finalValue}
      format={formatOptions}
      animated={isAnimationEnabled}
      className={className}
      style={style}
    />
  );
});
