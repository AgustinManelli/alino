"use client";

import styles from "./skeleton.module.css";

export default function Skeleton({
  style,
  delay,
}: {
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <div className={styles.subjectAddCardSkeletonContainer} style={style}>
      <div
        className={styles.subjectAddCardSkeleton}
        style={{ animationDelay: `${delay}s` }}
      ></div>
    </div>
  );
}
