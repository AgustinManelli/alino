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
  argTypes: {
    items: {
      description: "Array de objetos que se mostrarán en el dropdown.",
      control: { disable: true },
    },
    renderItem: {
      description:
        "Función que renderiza cada elemento de la lista del dropdown. Recibe el `item` y su `index`.",
      control: { disable: true },
    },
    triggerLabel: {
      description:
        "Función que renderiza el contenido del botón que activa el dropdown.",
      control: { disable: true },
    },
    setSelectedItem: {
      description:
        "Función callback que se ejecuta al seleccionar un ítem. Recibe el `item` seleccionado.",
      action: "setSelectedItem",
    },
    handleFocusToParentInput: {
      description:
        "Función callback opcional para manejar el foco después de cerrar el dropdown.",
      action: "handleFocusToParentInput",
    },
    side: {
      description:
        "Define el lado de alineación preferido del menú. `false` (defecto) alinea a la derecha del trigger, `true` alinea a la izquierda.",
      control: "boolean",
    },
    style: {
      description: "Objeto de estilos CSS para aplicar al botón `trigger`.",
      control: "object",
    },
  },
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
