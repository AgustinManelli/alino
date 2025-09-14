"use client";

import { Dropdown } from "@/components/ui/Dropdown";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { NoList, SquircleIcon } from "@/components/ui/icons/icons";
import { ListsType } from "@/lib/schemas/todo-schema";
import styles from "../task-input.module.css";

interface Props {
  lists: ListsType[];
  selectedList: ListsType | undefined;
  setSelectedList: (list: ListsType) => void;
  onFocusRequest: () => void;
}

export const ListSelectorDropdown = ({
  lists,
  selectedList,
  setSelectedList,
  onFocusRequest,
}: Props): JSX.Element => {
  const handleItemSelect = (list: ListsType): void => {
    setSelectedList(list);
    onFocusRequest();
  };

  const renderTriggerContent = (): JSX.Element => (
    <div className={styles.dropdownItemContainer}>
      {selectedList ? (
        selectedList.list.icon ? (
          <div style={{ width: "18px", height: "18px" }}>
            <EmojiMartComponent
              shortcodes={selectedList.list.icon}
              size="18px"
            />
          </div>
        ) : (
          <SquircleIcon
            style={{ width: "14px", fill: selectedList.list.color }}
          />
        )
      ) : (
        <NoList
          style={{
            width: "15px",
            stroke: "#1c1c1c",
            strokeWidth: 2,
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );

  const renderItemContent = (list: ListsType): JSX.Element => (
    <div
      className={styles.dropdownItemContainer}
      style={{ justifyContent: "start" }}
    >
      <div style={{ width: "16px", height: "16px" }}>
        {list.list.icon ? (
          <EmojiMartComponent shortcodes={list.list.icon} size="16px" />
        ) : (
          <SquircleIcon style={{ width: "14px", fill: list.list.color }} />
        )}
      </div>
      <p>{list.list.list_name}</p>
    </div>
  );

  return (
    <Dropdown>
      <Dropdown.Trigger>{renderTriggerContent()}</Dropdown.Trigger>

      <Dropdown.Content>
        {lists.map((list) => (
          <Dropdown.Item
            key={list.list.list_id}
            onClick={() => handleItemSelect(list)}
          >
            {renderItemContent(list)}
          </Dropdown.Item>
        ))}
      </Dropdown.Content>
    </Dropdown>
  );
};
