import { useState } from "react";
import styles from "./optionCard.module.css";

type ChildComponentProps = {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  hoverColor?: string | null;
};

const OptionCard: React.FC<ChildComponentProps> = ({
  name,
  icon,
  action,
  hoverColor,
}) => {
  const [optionHover, setOptionHover] = useState<boolean>(false);
  return (
    <div
      className={styles.options}
      style={{
        backgroundColor: optionHover
          ? hoverColor
            ? `${hoverColor}`
            : "rgb(245,245,245)"
          : "transparent",
      }}
      onMouseEnter={() => {
        setOptionHover(true);
      }}
      onMouseLeave={() => {
        setOptionHover(false);
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      }}
    >
      {icon}
      <p>{name}</p>
    </div>
  );
};

export default OptionCard;
