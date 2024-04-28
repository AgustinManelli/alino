import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function Counter({ tasksLength = 0 }: { tasksLength: number }) {
  const [cant, setCant] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 80,
    stiffness: 200,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(cant);
    }
  }, [motionValue, isInView, cant]);

  useEffect(() => {
    setCant(tasksLength);
  }, [tasksLength]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US").format(
            latest.toFixed(0)
          );
        }
      }),
    [springValue]
  );

  return <span ref={ref}>0</span>;
}
