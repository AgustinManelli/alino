import React from "react";
import styles from "./NumberInput.module.css";

interface Props {
  value: number;
  onChange: (newValue: number) => void;
  min: number;
  max: number;
}

export const NumberInput: React.FC<Props> = ({ value, onChange, min, max }) => {
  const handleDecrement = () => {
    onChange(Math.max(min, value - 1));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, numValue));
    onChange(clampedValue);
  };

  return (
    <div className={styles.configRow}>
      <div className={styles.numberInputContainer}>
        <button
          type="button"
          onClick={handleDecrement}
          className={styles.controlButton}
        >
          -
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          className={styles.timeInput}
        />
        <button
          type="button"
          onClick={handleIncrement}
          className={styles.controlButton}
        >
          +
        </button>
      </div>
    </div>
  );
};
