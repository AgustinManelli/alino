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

export const DropdownListInput = ({
  isList,
  color,
  setIsList,
  setColor,
  DEFAULT_COLOR,
}: Props): JSX.Element => {
  const handleSelected = (item: Item): void => {
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

  const renderTriggerContent = (): JSX.Element => (
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

  const renderItemContent = (item: Item): JSX.Element => (
    <div
      className={styles.dropdownItemContainer}
      style={{ justifyContent: "start" }}
    >
      <p>{item.label}</p>
    </div>
  );

  return (
    <Dropdown>
      <Dropdown.Trigger
        style={{
          height: "30px",
          width: "30px",
          aspectRatio: "1/1",
        }}
      >
        {renderTriggerContent()}
      </Dropdown.Trigger>

      <Dropdown.Content>
        {items.map((item, index) => (
          <Dropdown.Item
            key={`dropdown-item-${item.id}`}
            onClick={() => handleSelected(item)}
          >
            {renderItemContent(item)}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
};
