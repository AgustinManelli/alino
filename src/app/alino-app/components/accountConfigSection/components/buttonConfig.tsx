"use client";

import { useState } from "react";
import { ConfirmationModal } from "@/components/confirmation-modal";

interface props {
  name: string;
  action: () => void;
  setAllowClose: (value: boolean) => void;
  stylesProp?: React.CSSProperties;
  deleteModalText: string;
  additionalDeleteModalText: string;
}
export function ButtonConfig({
  name,
  action,
  setAllowClose,
  stylesProp,
  deleteModalText,
  additionalDeleteModalText,
}: props) {
  const [isDeleteConfirm, setIsDeleteConfirm] = useState<boolean>(false);

  return (
    <>
      {isDeleteConfirm && (
        <ConfirmationModal
          text={deleteModalText}
          aditionalText={additionalDeleteModalText}
          isDeleteConfirm={setIsDeleteConfirm}
          handleDelete={action}
          setAllowCloseNavbar={setAllowClose}
        />
      )}
      <button
        onClick={() => {
          setIsDeleteConfirm(true);
          setAllowClose(false);
        }}
        style={{
          cursor: "pointer",
          border: "none",
          WebkitTapHighlightColor: "transparent",
          ...stylesProp,
        }}
      >
        {name}
      </button>
    </>
  );
}
