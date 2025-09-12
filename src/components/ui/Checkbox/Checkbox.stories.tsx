import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./index";
import "./Checkbox.module.css";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Un checkbox animado para marcar o desmarcar tareas y otros elementos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "boolean",
      description: "Define si el checkbox está marcado o no.",
    },
    disabled: {
      control: "boolean",
      description: "Define si el checkbox está habilitado para la interacción.",
      defaultValue: { summary: "false" },
    },
    ariaLabel: {
      control: "text",
      description: "Etiqueta de accesibilidad para lectores de pantalla.",
    },
    handleUpdateStatus: {
      action: "handleUpdateStatus called",
      description: "Función callback que se invoca al hacer clic.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [status, setStatus] = useState<boolean>(true);

    return (
      <Checkbox
        status={status}
        handleUpdateStatus={() => setStatus((s) => !s)}
      />
    );
  },
};

export const Checked: Story = {
  name: "Marcado (Checked)",
  args: {
    status: true,
    disabled: false,
    ariaLabel: "Desmarcar esta opción",
  },
};

export const Unchecked: Story = {
  name: "Desmarcado (Unchecked)",
  args: {
    status: false,
    disabled: false,
    ariaLabel: "Marcar esta opción",
  },
};

export const Disabled: Story = {
  name: "Deshabilitado (Disabled)",
  args: {
    status: false,
    disabled: true,
    ariaLabel: "Opción no disponible",
  },
};
