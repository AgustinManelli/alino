"use client";

import { useModalStore } from "@/store/useModalStore";

interface ButtonConfigProps {
  name: string;
  action: () => void;
  stylesProp?: React.CSSProperties;
  modalText: string;
  explainText: string;
}
export function ButtonConfig({
  name,
  action,
  stylesProp,
  modalText,
  explainText,
}: ButtonConfigProps) {
  const openConfirmationModal = useModalStore((s) => s.open);

  const handleConfirm = () => {
    openConfirmationModal({
      type: "confirmation",
      props: {
        text: modalText,
        onConfirm: action,
        additionalText: explainText,
      },
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleConfirm();
      }}
      style={{
        cursor: "pointer",
        border: "none",
        fontSize: "14px",
        width: "fit-content",
        height: "100%",
        padding: "0 10px",
        borderRadius: "5px",
        backgroundColor: "var(--background-over-container)",
        WebkitTapHighlightColor: "transparent",
        ...stylesProp,
      }}
    >
      {name}
    </button>
  );
}
