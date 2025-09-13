"use client";

import { Dropdown } from "@/components/ui/dropdown";
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
}: Props) => {
  const renderItem = (list: ListsType) => (
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

  const renderTrigger = () => (
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

  return (
    <Dropdown
      items={lists}
      renderItem={renderItem}
      triggerLabel={renderTrigger}
      setSelectedItem={setSelectedList}
      handleFocusToParentInput={onFocusRequest}
    />
  );
};
