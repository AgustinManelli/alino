// "use client";

// import type { Database } from "@/lib/schemas/todo-schema";
// import { motion } from "framer-motion";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useState, useRef, useEffect } from "react";
// import { DeleteIcon } from "@/components/ui/icons/icons";
// import { useTodoDataStore } from "@/store/useTodoDataStore";
// import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
// import styles from "./task-card.module.css";

// type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

// export function TaskCard({ task }: { task: TaskType }) {
//   const [completed, setCompleted] = useState<boolean>(task.completed);
//   const [hover, setHover] = useState<boolean>(false);
//   const [lines, setLines] = useState<
//     { width: number; top: number; left: number }[]
//   >([]);
//   const textRef = useRef<HTMLParagraphElement>(null);

//   const deleteTask = useTodoDataStore((state) => state.deleteTask);
//   const updateTaskCompleted = useTodoDataStore(
//     (status) => status.updateTaskCompleted
//   );
//   const { isMobile } = usePlatformInfoStore();

//   useEffect(() => {
//     const calculateLines = () => {
//       if (!textRef.current) return;

//       const range = document.createRange();
//       const textNodes: Node[] = [];

//       function findTextNodes(node: Node) {
//         if (node.nodeType === Node.TEXT_NODE) {
//           textNodes.push(node);
//         } else {
//           node.childNodes.forEach(findTextNodes);
//         }
//       }

//       findTextNodes(textRef.current);

//       const newLines: { width: number; top: number; left: number }[] = [];
//       const containerRect = textRef.current.getBoundingClientRect();

//       textNodes.forEach((textNode) => {
//         range.selectNodeContents(textNode);
//         const rects = Array.from(range.getClientRects());

//         rects.forEach((rect) => {
//           newLines.push({
//             width: rect.width,
//             top: rect.top - containerRect.top + rect.height / 2,
//             left: rect.left - containerRect.left,
//           });
//         });
//       });

//       setLines(newLines);
//     };

//     calculateLines();
//     window.addEventListener("resize", calculateLines);

//     return () => {
//       window.removeEventListener("resize", calculateLines);
//     };
//   }, []); // Recalcular cuando cambie el texto

//   const handleDelete = () => {
//     deleteTask(task.id);
//   };

//   const handleUpdateStatus = () => {
//     setCompleted(!completed);
//     updateTaskCompleted(task.id, !completed);
//   };

//   return (
//     <div
//       className={styles.cardContainer}
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//     >
//       <div className={styles.leftContainer}>
//         <Checkbox
//           status={completed}
//           handleUpdateStatus={handleUpdateStatus}
//           id={task.id}
//         />
//         <div style={{ position: "relative" }}>
//           <p
//             ref={textRef}
//             className={styles.text}
//             style={{ opacity: completed ? 0.3 : 1 }}
//           >
//             {task.name}
//           </p>
//           {lines.map((line, index) => (
//             <motion.div
//               key={index}
//               style={{
//                 position: "absolute",
//                 pointerEvents: "none",
//                 top: line.top,
//                 left: line.left,
//                 width: line.width,
//               }}
//             >
//               <motion.svg
//                 width="100%"
//                 height="6"
//                 viewBox={`0 0 ${line.width} 6`}
//                 style={{ display: "block" }}
//               >
//                 <motion.path
//                   d={`
//                     M 0 3
//                     Q ${line.width * 0.1} 0, ${line.width * 0.2} 3
//                     Q ${line.width * 0.3} 6, ${line.width * 0.4} 3
//                     Q ${line.width * 0.5} 0, ${line.width * 0.6} 3
//                     Q ${line.width * 0.7} 6, ${line.width * 0.8} 3
//                     Q ${line.width * 0.9} 0, ${line.width} 3
//                   `}
//                   stroke="#1c1c1c"
//                   strokeWidth="2"
//                   fill="none"
//                   initial={{ pathLength: 0 }}
//                   animate={{ pathLength: completed ? 1 : 0 }}
//                   transition={{
//                     duration: 0.2,
//                     delay: index * 0.1,
//                     ease: "easeInOut",
//                   }}
//                 />
//               </motion.svg>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//       <button
//         className={styles.deleteButton}
//         style={{ opacity: hover || isMobile ? "1" : "0" }}
//         onClick={handleDelete}
//       >
//         <DeleteIcon
//           style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "2" }}
//         />
//       </button>
//     </div>
//   );
// }

"use client";

import type { Database } from "@/lib/schemas/todo-schema";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect } from "react";
import { DeleteIcon } from "@/components/ui/icons/icons";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import styles from "./task-card.module.css";

type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskCard({ task }: { task: TaskType }) {
  const [completed, setCompleted] = useState<boolean>(task.completed);
  const [hover, setHover] = useState<boolean>(false);
  const [lines, setLines] = useState<
    { width: number; top: number; left: number }[]
  >([]);
  const textRef = useRef<HTMLParagraphElement>(null);

  const deleteTask = useTodoDataStore((state) => state.deleteTask);
  const updateTaskCompleted = useTodoDataStore(
    (status) => status.updateTaskCompleted
  );
  const { isMobile } = usePlatformInfoStore();

  useEffect(() => {
    const calculateLines = () => {
      if (!textRef.current) return;

      const range = document.createRange();
      const textNodes: Node[] = [];

      function findTextNodes(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node);
        } else {
          node.childNodes.forEach(findTextNodes);
        }
      }

      findTextNodes(textRef.current);

      const newLines: { width: number; top: number; left: number }[] = [];
      const containerRect = textRef.current.getBoundingClientRect();

      textNodes.forEach((textNode) => {
        range.selectNodeContents(textNode);
        const rects = Array.from(range.getClientRects());

        rects.forEach((rect) => {
          newLines.push({
            width: rect.width,
            top: rect.top - containerRect.top + rect.height / 2,
            left: rect.left - containerRect.left,
          });
        });
      });

      setLines(newLines);
    };

    calculateLines();
    window.addEventListener("resize", calculateLines);

    return () => {
      window.removeEventListener("resize", calculateLines);
    };
  }, []);

  const generateWavePath = (width: number) => {
    const waveSegments = Math.max(4, Math.floor(width / 20));
    const step = width / waveSegments;

    return `
      M 0 3
      ${Array.from({ length: waveSegments }, (_, i) => {
        const x1 = step * (i + 0.5);
        const y1 = i % 2 === 0 ? 0 : 6;
        const x2 = step * (i + 1);
        return `Q ${x1} ${y1}, ${x2} 3`;
      }).join(" ")}
    `;
  };

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleUpdateStatus = () => {
    setCompleted(!completed);
    updateTaskCompleted(task.id, !completed);
  };

  return (
    <div
      className={styles.cardContainer}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.leftContainer}>
        <Checkbox
          status={completed}
          handleUpdateStatus={handleUpdateStatus}
          id={task.id}
        />
        <div style={{ position: "relative" }}>
          <p
            ref={textRef}
            className={styles.text}
            style={{ opacity: completed ? 0.3 : 1 }}
          >
            {task.name}
          </p>
          {lines.map((line, index) => (
            <motion.div
              key={index}
              style={{
                position: "absolute",
                pointerEvents: "none",
                top: line.top,
                left: line.left,
                width: line.width,
              }}
            >
              <motion.svg
                width="100%"
                height="6"
                viewBox={`0 0 ${line.width} 6`}
                style={{ display: "block" }}
              >
                <motion.path
                  d={generateWavePath(line.width)}
                  stroke="#1c1c1c"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: completed ? 1 : 0 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                />
              </motion.svg>
            </motion.div>
          ))}
        </div>
      </div>
      <button
        className={styles.deleteButton}
        style={{ opacity: hover || isMobile ? "1" : "0" }}
        onClick={handleDelete}
      >
        <DeleteIcon
          style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "2" }}
        />
      </button>
    </div>
  );
}
