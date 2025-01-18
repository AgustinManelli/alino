"use client";

import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";

export function CounterAnimation({
  tasksLength = 0,
}: {
  tasksLength: number | undefined;
}) {
  const [value, setValue] = useState<number>(0);
  useEffect(() => {
    setValue(tasksLength);
  }, [tasksLength]);
  return <NumberFlow value={value} format={{ notation: "compact" }} />;
}
