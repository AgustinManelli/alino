"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

export function CounterAnimation({
  tasksLength = 0,
  format = false,
  isAnimationEnabled = true,
}: {
  tasksLength: number | undefined;
  format?: boolean | undefined;
  isAnimationEnabled?: boolean;
}) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!isAnimationEnabled) {
      setAnimationKey((prevKey) => prevKey + 1);
    }
  }, [tasksLength, isAnimationEnabled]);

  return (
    <NumberFlow
      value={tasksLength}
      key={animationKey}
      format={{
        notation: "compact",
        minimumIntegerDigits: format ? 2 : 1,
        useGrouping: false,
      }}
    />
  );
}
