// DropdownListInput.tsx
import { memo, useCallback } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { FolderOpen, ListIcon } from "@/components/ui/icons/icons";
import styles from "./DropdownListInput.module.css";

interface Item {
  id: number;
  label: string;
}

interface Props {
  isList: boolean;
  color: string | null;
  setIsList: (value: boolean) => void;
  setColor: (value: string | null) => void;
  DEFAULT_COLOR: string;
}

const items: Item[] = [
  { id: 1, label: "Lista" },
  { id: 2, label: "Carpeta" },
];

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
  color,
  setIsList,
  setColor,
  DEFAULT_COLOR,
}: Props) {
  const handleSelected = useCallback(
    (item: Item) => {
      if (item.id === 1) {
        setIsList(true);
        if (color === null) setColor(DEFAULT_COLOR);
        return;
      }
      if (item.id === 2) {
        setIsList(false);
        setColor(null);
        return;
      }
    },
    [color, DEFAULT_COLOR, setColor, setIsList],
  );

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
        {items.map((item) => (
          <Dropdown.Item
            key={`dropdown-item-${item.id}`}
            onClick={() => handleSelected(item)}
          >
            <div
              className={styles.dropdownItemContainer}
              style={containerStyle}
            >
              <p>{item.label}</p>
            </div>
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
});
