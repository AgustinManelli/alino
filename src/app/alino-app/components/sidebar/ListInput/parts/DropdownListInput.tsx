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

const items = [
  { id: 1, label: "Lista" },
  { id: 2, label: "Carpeta" },
];

export const DropdownListInput = ({
  isList,
  color,
  setIsList,
  setColor,
  DEFAULT_COLOR,
}: Props) => {
  const handleSelected = (item: Item) => {
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
  };

  const renderItem = (item: Item) => {
    return (
      <div
        className={styles.dropdownItemContainer}
        style={{ justifyContent: "start" }}
      >
        <p>{item.label}</p>
      </div>
    );
  };

  const triggerLabelType = () => {
    return (
      <div
        className={styles.dropdownItemContainer}
        style={{ justifyContent: "start" }}
      >
        <div
          style={{
            width: "15px",
            height: "15px",
            display: "flex",
          }}
        >
          {isList ? (
            <ListIcon
              style={{
                stroke: "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          ) : (
            <FolderOpen
              style={{
                stroke: "var(--text-not-available)",
                width: "15px",
                height: "15px",
                strokeWidth: 2,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Dropdown
      items={items}
      renderItem={renderItem}
      triggerLabel={triggerLabelType}
      setSelectedItem={handleSelected}
      style={{ height: "30px", width: "30px", aspectRatio: "1/1" }}
    />
  );
};
