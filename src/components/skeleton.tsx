"use client";

import styles from "./skeleton.module.css";

export default function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div className={styles.subjectAddCardSkeletonContainer} style={style}>
      <div className={styles.subjectAddCardSkeleton}></div>
    </div>
  );
}
