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
        component:
          "Un dropdown genérico animado usando patrón de composición. Incluye Dropdown.Trigger, Dropdown.Content y Dropdown.Item.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      description: "Componentes hijos: Dropdown.Trigger y Dropdown.Content",
      control: { disable: true },
    },
    side: {
      description:
        "Define el lado de alineación preferido del menú. `false` (defecto) alinea a la derecha del trigger, `true` alinea a la izquierda.",
      control: "boolean",
    },
    onClose: {
      description:
        "Función callback opcional que se ejecuta al cerrar el dropdown.",
      action: "onClose",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

interface Item {
  id: number;
  label: string;
}

// Story principal con el patrón de composición
export const Default: Story = {
  render: () => {
    const items: Item[] = [
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

    const handleItemSelect = (item: Item): void => {
      setSelectedItem(item);
    };

    return (
      <Dropdown>
        <Dropdown.Trigger
          style={{
            padding: "8px 16px",
            minWidth: "120px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <span>{selectedItem.label}</span>
        </Dropdown.Trigger>

        <Dropdown.Content>
          {items.map((item) => (
            <Dropdown.Item
              key={`item-${item.id}`}
              onClick={() => handleItemSelect(item)}
            >
              <div style={{ padding: "4px 8px" }}>
                <p style={{ margin: 0 }}>
                  {item.id} - {item.label}
                </p>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    );
  },
};

// Story con diferentes estilos de items
export const WithIcons: Story = {
  render: () => {
    interface IconItem {
      id: number;
      label: string;
      icon: string;
    }

    const items: IconItem[] = [
      { id: 1, label: "Home", icon: "🏠" },
      { id: 2, label: "Profile", icon: "👤" },
      { id: 3, label: "Settings", icon: "⚙️" },
      { id: 4, label: "Help", icon: "❓" },
      { id: 5, label: "Logout", icon: "🚪" },
    ];

    const [selectedItem, setSelectedItem] = useState<IconItem>(items[0]);

    return (
      <Dropdown>
        <Dropdown.Trigger
          style={{
            padding: "8px 16px",
            minWidth: "140px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        >
          <span>{selectedItem.icon}</span>
          <span>{selectedItem.label}</span>
        </Dropdown.Trigger>

        <Dropdown.Content>
          {items.map((item) => (
            <Dropdown.Item
              key={`icon-item-${item.id}`}
              onClick={() => setSelectedItem(item)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 8px",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    );
  },
};

// Story con posicionamiento lateral
export const SideAlignment: Story = {
  render: () => {
    const items: Item[] = [
      { id: 1, label: "Opción A" },
      { id: 2, label: "Opción B" },
      { id: 3, label: "Opción C" },
    ];

    const [selectedItem, setSelectedItem] = useState<Item>(items[0]);

    return (
      <Dropdown side={true}>
        <Dropdown.Trigger
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <span>{selectedItem.label} (Side)</span>
        </Dropdown.Trigger>

        <Dropdown.Content>
          {items.map((item) => (
            <Dropdown.Item
              key={`side-item-${item.id}`}
              onClick={() => setSelectedItem(item)}
            >
              <div style={{ padding: "8px 12px" }}>
                <p style={{ margin: 0 }}>{item.label}</p>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    );
  },
};

// Story minimalista
export const Minimal: Story = {
  render: () => {
    const items: string[] = ["Red", "Green", "Blue", "Yellow"];
    const [selected, setSelected] = useState<string>(items[0]);

    return (
      <Dropdown>
        <Dropdown.Trigger
          style={{
            padding: "4px 12px",
            fontSize: "14px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "white",
          }}
        >
          {selected}
        </Dropdown.Trigger>

        <Dropdown.Content>
          {items.map((item, index) => (
            <Dropdown.Item
              key={`color-${index}`}
              onClick={() => setSelected(item)}
            >
              <div
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                }}
              >
                {item}
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown>
    );
  },
};

// Story con callback onClose
export const WithCloseCallback: Story = {
  render: () => {
    const items: Item[] = [
      { id: 1, label: "Action 1" },
      { id: 2, label: "Action 2" },
      { id: 3, label: "Action 3" },
    ];

    const [selectedItem, setSelectedItem] = useState<Item>(items[0]);
    const [closeCount, setCloseCount] = useState<number>(0);

    const handleClose = (): void => {
      setCloseCount((prev) => prev + 1);
    };

    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: "16px" }}>
          Dropdown cerrado {closeCount} veces
        </p>

        <Dropdown onClose={handleClose}>
          <Dropdown.Trigger
            style={{
              padding: "8px 16px",
              border: "1px solid #007acc",
              borderRadius: "6px",
              color: "#007acc",
            }}
          >
            <span>{selectedItem.label}</span>
          </Dropdown.Trigger>

          <Dropdown.Content>
            {items.map((item) => (
              <Dropdown.Item
                key={`callback-item-${item.id}`}
                onClick={() => setSelectedItem(item)}
              >
                <div style={{ padding: "8px 12px" }}>
                  <p style={{ margin: 0 }}>{item.label}</p>
                </div>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div>
    );
  },
};
