import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import WIDGET_COMPONENTS from "@/config/widgetComponents";
import WIDGET_UI_META from "@/config/widgetUiMeta";
import { WidgetPreviewProvider } from "@/context/WidgetPreviewContext";
import styles from "./WidgetPreview.module.css";

interface Props {
  componentKey: string;
  title: string;
}

export const WidgetPreview = ({ componentKey, title }: Props) => {
  const Component = WIDGET_COMPONENTS[componentKey];
  const meta = WIDGET_UI_META[componentKey] ?? { icon: null, color: "#6366f1" };
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!Component) {
    return (
      <div className={styles.placeholder}>
        <span>Preview no disponible</span>
      </div>
    );
  }

  return (
    <div className={styles.perspectiveContainer}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className={styles.previewCard}
      >
        <div
          className={styles.previewInner}
          style={{
            transform: "translateZ(30px) scale(0.98)",
          }}
        >
          {!(meta.withoutHeader ?? false) && (
            <header className={styles.bentoHeader}>
              <div
                className={styles.bentoBadge}
                style={
                  meta.color
                    ? {
                        backgroundColor: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
                        color: meta.color,
                      }
                    : {}
                }
              >
                {meta.icon && (
                  <span className={styles.badgeIcon}>{meta.icon}</span>
                )}
                <h3 className={styles.bentoTitle}>{title}</h3>
              </div>
            </header>
          )}
          <div className={styles.bentoBody}>
            <WidgetPreviewProvider value={true}>
              <Component />
            </WidgetPreviewProvider>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
