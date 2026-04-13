"use client";

import { useEffect, useRef, useLayoutEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import styles from "./manager.module.css";

export const ManagerSkeleton = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const section1Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sectionEl = section1Ref.current;
    const scrollEl = scrollRef.current;
    if (!sectionEl || !scrollEl) return;
    scrollEl.style.paddingTop = `${sectionEl.offsetHeight}px`;
  }, []);

  useEffect(() => {
    const sectionEl = section1Ref.current;
    const scrollEl = scrollRef.current;
    if (!sectionEl || !scrollEl) return;

    let prevHeight = sectionEl.offsetHeight;

    const applyPadding = () => {
      if (sectionEl && scrollEl) {
        const currentHeight = sectionEl.offsetHeight;

        if (currentHeight < prevHeight) {
          scrollEl.style.transition = "none";
          scrollEl.style.paddingTop = `${currentHeight}px`;
        } else {
          scrollEl.style.transition = "padding-top 0.1s ease-in-out";
          scrollEl.style.paddingTop = `${currentHeight}px`;
        }

        prevHeight = currentHeight;
      }
    };

    const ro = new ResizeObserver(applyPadding);
    ro.observe(sectionEl);

    return () => {
      ro.disconnect();
    };
  }, []);
  return (
    <>
      <div className={styles.container}>
        <section className={styles.section1} ref={section1Ref}>
          <div className={styles.header}>
            <div className={styles.listContainer}>
              <div className={styles.titleSection}>
                <Skeleton
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "10px",
                  }}
                />
              </div>
              <p className={styles.listSubtitle}>
                <span>
                  <Skeleton
                    style={{
                      width: "100%",
                      height: "17px",
                      borderRadius: "10px",
                      maxWidth: "100px",
                    }}
                  />
                </span>
              </p>
            </div>
            <div className={styles.configSection}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Skeleton
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "7px",
                  }}
                />
                <Skeleton
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "7px",
                  }}
                />
              </div>
            </div>
          </div>
          <div className={styles.inputSection}>
            <Skeleton
              style={{ width: "100%", height: "50px", borderRadius: "15px" }}
            />
          </div>
        </section>
        {/* <section className={styles.section2}>
          <div
            className={styles.tasksSection}
            id={"task-section-scroll-area"}
            ref={scrollRef}
          >
            <div className={styles.tasks}>
              {Array(3)
                .fill(null)
                .map((_, index) => (
                  <Skeleton
                    style={{
                      width: "100%",
                      height: "50px",
                      borderRadius: "15px",
                    }}
                    delay={index * 0.15}
                    key={`skeleton-${index}`}
                  />
                ))}
            </div>
          </div>
        </section> */}
      </div>
    </>
  );
};
