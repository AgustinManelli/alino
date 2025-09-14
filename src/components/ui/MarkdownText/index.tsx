import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import styles from "./MarkdownText.module.css";

interface Props {
  content: string;
}

export const MarkdownText = ({ content }: Props) => {
  const markdownComponents = useMemo(
    (): Components => ({
      // Encabezados
      h1: ({ children }) => (
        <h1 className={styles.taskHeadingH1}>{children}</h1>
      ),
      h2: ({ children }) => (
        <h2 className={styles.taskHeadingH2}>{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className={styles.taskHeadingH3}>{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className={styles.taskHeadingH4}>{children}</h4>
      ),
      h5: ({ children }) => (
        <h5 className={styles.taskHeadingH5}>{children}</h5>
      ),
      h6: ({ children }) => (
        <h6 className={styles.taskHeadingH6}>{children}</h6>
      ),

      // Párrafos
      p: ({ children }) => <p className={styles.taskParagraph}>{children}</p>,

      // Texto con formato
      strong: ({ children }) => (
        <strong className={styles.taskBold}>{children}</strong>
      ),
      em: ({ children }) => <em className={styles.taskItalic}>{children}</em>,

      // Código
      code: ({ children, inline }) => (
        <code className={inline ? styles.taskInlineCode : styles.taskCodeBlock}>
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className={styles.taskPreBlock}>{children}</pre>
      ),

      // Listas
      ul: ({ children }) => (
        <ul className={styles.taskUnorderedList}>{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className={styles.taskOrderedList}>{children}</ol>
      ),
      li: ({ children }) => <li className={styles.taskListItem}>{children}</li>,

      // Enlaces
      a: ({ href, children }) => (
        <a
          href={href}
          className={styles.taskLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),

      // Citas
      blockquote: ({ children }) => (
        <blockquote className={styles.taskBlockquote}>{children}</blockquote>
      ),

      // Separadores
      hr: () => <hr className={styles.taskHorizontalRule} />,

      // Tablas
      table: ({ children }) => (
        <div className={styles.taskTableContainer}>
          <table className={styles.taskTable}>{children}</table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className={styles.taskTableHead}>{children}</thead>
      ),
      tbody: ({ children }) => (
        <tbody className={styles.taskTableBody}>{children}</tbody>
      ),
      tr: ({ children }) => <tr className={styles.taskTableRow}>{children}</tr>,
      th: ({ children }) => (
        <th className={styles.taskTableHeader}>{children}</th>
      ),
      td: ({ children }) => (
        <td className={styles.taskTableCell}>{children}</td>
      ),

      // Imágenes
      img: ({ src, alt }) => (
        <img src={src} alt={alt} className={styles.taskImage} loading="lazy" />
      ),
    }),
    []
  );
  return (
    <ReactMarkdown
      components={markdownComponents}
      skipHtml={false}
      linkTarget="_blank"
    >
      {content}
    </ReactMarkdown>
  );
};
