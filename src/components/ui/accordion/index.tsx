"use client";

import { useState } from "react";

import { ArrowThin } from "@/components/ui/icons/icons";
import styles from "./accordion.module.css";

interface AccordionItem {
  title: string;
  content: string;
}

interface props {
  items: AccordionItem[];
}

export function Accordion({ items }: props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={styles.accordion}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.accordionItem} ${activeIndex === index ? styles.active : ""}`}
        >
          <div
            className={styles.accordionHeader}
            onClick={() => handleToggle(index)}
          >
            <h3>{item.title}</h3>
            <ArrowThin
              style={{
                strokeWidth: "1.5",
                stroke: "#1c1c1c",
                width: "20px",
                height: "auto",
                transform: activeIndex === index ? "rotate(90deg)" : "",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
          <div
            className={styles.accordionContent}
            dangerouslySetInnerHTML={{ __html: item.content }}
          ></div>
        </div>
      ))}
    </div>
  );
}
