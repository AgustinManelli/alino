"use client";

import styles from "./skeleton.module.css";

interface props {
  style?: React.CSSProperties;
  delay?: number;
}

export function Skeleton({ style, delay }: props) {
  return (
    <div className={styles.subjectAddCardSkeletonContainer} style={style}>
      <div
        className={styles.subjectAddCardSkeleton}
        style={{ animationDelay: `${delay}s` }}
      ></div>
    </div>
  );
}
