import { useState, useEffect } from "react";
import * as chrono from "chrono-node";

export interface SmartDateResult {
  text: string;
  index: number;
  date: Date;
  hour?: string;
}

export const useSmartDate = (text: string) => {
  const [detected, setDetected] = useState<SmartDateResult | null>(null);

  useEffect(() => {
    if (!text || text.trim() === "") {
      setDetected(null);
      return;
    }

    const results = chrono.es.parse(text, new Date(), { forwardDate: true });

    if (results.length > 0) {
      const match = results[0];
      const parsedDate = match.start.date();

      let hour: string | undefined = undefined;

      if (match.start.isCertain("hour")) {
        const h = match.start.get("hour") ?? 0;
        const m = match.start.get("minute") ?? 0;
        hour = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      }
      
      setDetected({
        text: match.text,
        index: match.index,
        date: parsedDate,
        hour,
      });
    } else {
      setDetected(null);
    }
  }, [text]);

  return detected;
};
