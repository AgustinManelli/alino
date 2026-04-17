"use client";

import { memo } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { FolderOpen, ListIcon } from "@/components/ui/icons/icons";
import styles from "./DropdownListInput.module.css";

interface Props {
  isList: boolean;
  onToggleType: (isList: boolean) => void;
}

const triggerStyle = { height: "30px", width: "30px", aspectRatio: "1/1" };
const containerStyle = { justifyContent: "start" };
const iconContainerStyle = { width: "15px", height: "15px", display: "flex" };
const iconStyle = {
  stroke: "var(--text-not-available)",
  width: "15px",
  height: "15px",
  strokeWidth: 2,
};

export const DropdownListInput = memo(function DropdownListInput({
  isList,
  onToggleType,
}: Props) {
  return (
    <Dropdown>
      <Dropdown.Trigger style={triggerStyle}>
        <div className={styles.dropdownItemContainer} style={containerStyle}>
          <div style={iconContainerStyle}>
            {isList ? (
              <ListIcon style={iconStyle} />
            ) : (
              <FolderOpen style={iconStyle} />
            )}
          </div>
        </div>
      </Dropdown.Trigger>

      <Dropdown.Content>
        <Dropdown.Item onClick={() => onToggleType(true)}>
          <div className={styles.dropdownItemContainer} style={containerStyle}>
            <p>Lista</p>
          </div>
        </Dropdown.Item>

        <Dropdown.Item onClick={() => onToggleType(false)}>
          <div className={styles.dropdownItemContainer} style={containerStyle}>
            <p>Carpeta</p>
          </div>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
  );
});
