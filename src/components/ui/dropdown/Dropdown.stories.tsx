import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./index";
import "./Dropdown.module.css";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Un dropdown genérico animado.",
      },
    },
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof meta>;

interface Item {
  id: number;
  label: string;
}

export const Default: Story = {
  render: () => {
    const items = [
      { id: 1, label: "Item 1" },
      { id: 2, label: "Item 2" },
      { id: 3, label: "Item 3" },
      { id: 4, label: "Item 4" },
      { id: 5, label: "Item 5" },
      { id: 6, label: "Item 6" },
      { id: 7, label: "Item 7" },
      { id: 8, label: "Item 8" },
      { id: 9, label: "Item 9" },
      { id: 10, label: "Item 10" },
    ];

    const [selectedItem, setSelectedItem] = useState<Item>(items[0]);

    const renderItemType = (item: Item) => {
      return (
        <p>
          {item.id}-{item.label}
        </p>
      );
    };

    const triggerLabel = () => {
      return <p>{selectedItem.label}</p>;
    };

    const handleSetSelectedItem = (item: Item) => {
      setSelectedItem(item);
    };

    return (
      <Dropdown
        items={items}
        renderItem={renderItemType}
        triggerLabel={triggerLabel}
        setSelectedItem={handleSetSelectedItem}
        handleFocusToParentInput={() => {}}
        style={{}}
      />
    );
  },
};
