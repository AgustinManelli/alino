"use client";

import { useState } from "react";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";

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
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<boolean>(false);

  return (
    <>
      {isDeleteConfirm && (
        <ConfirmationModal
          text={modalText}
          aditionalText={explainText}
          handleDelete={action}
          isDeleteConfirm={setIsDeleteConfirm}
          withBackground={false}
          id={"config-modal"}
        />
      )}
      <button
        onClick={() => {
          setIsDeleteConfirm(true);
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
    </>
  );
}
