import styles from "./modal-box.module.css";

interface ModalBoxProps {
  title: string;
  footer: string;
  children: React.ReactNode;
}

export default function ModalBox({ title, footer, children }: ModalBoxProps) {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      <div className={styles.separator}></div>
      {children}
      <div className={styles.separator}></div>
      <p className={styles.title}>{footer}</p>
    </div>
  );
}
