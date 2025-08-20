"use client";

import { Skeleton } from "@/components/ui/skeleton";

import styles from "./loading.module.css";

export default function LoadingSkeletons() {
  return (
    <div className={styles.container}>
      <section className={styles.section1}>
        <div className={styles.header}>
          <div className={styles.listContainer}>
            <div className={styles.titleSection}>
              <Skeleton
                style={{
                  width: "100%",
                  height: "30px",
                  borderRadius: "10px",
                }}
              />
            </div>
            <p className={styles.listSubtitle}>
              <Skeleton
                style={{ width: "50%", height: "17px", borderRadius: "5px" }}
              />
            </p>
          </div>
          <div className={styles.configSection}>
            <Skeleton
              style={{ width: "25px", height: "25px", borderRadius: "5px" }}
            />
          </div>
        </div>
        <div className={styles.inputSection}>
          <Skeleton
            style={{ width: "100%", height: "50px", borderRadius: "15px" }}
          />
        </div>
      </section>
    </div>
  );
}
