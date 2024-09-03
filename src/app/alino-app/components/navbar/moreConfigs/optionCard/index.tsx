import { useState } from "react";
import styles from "./optionCard.module.css";

type ChildComponentProps = {
  name: string;
  icon: React.ReactNode;
  action?: () => void;
};

const OptionCard: React.FC<ChildComponentProps> = ({ name, icon, action }) => {
  const [optionHover, setOptionHover] = useState<boolean>(false);
  return (
    <div
      className={styles.options}
      style={{
        backgroundColor: optionHover ? "rgb(245,245,245)" : "transparent",
      }}
      onMouseEnter={() => {
        setOptionHover(true);
      }}
      onMouseLeave={() => {
        setOptionHover(false);
      }}
      onClick={action}
    >
      {icon}
      <p>{name}</p>
    </div>
  );
};

export default OptionCard;
