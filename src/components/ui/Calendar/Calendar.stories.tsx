import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./index";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Selector de fecha y hora.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    selected: {
      control: "date",
      description: "Define la fecha seleccionada y activa.",
    },
    setSelected: {
      action: "setSelected called",
      description: "Función callback para seleccionar fecha.",
    },
    hour: {
      control: "text",
      description: "Define la hora seleccionada y activa.",
    },
    setHour: {
      action: "setHour called",
      description: "Función callback para seleccionar hora.",
    },
    focusToParentInput: {
      action: "focusToParentInput called",
      description:
        "Función callback para hacer focus en input al cerrar el calendario.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(undefined);
    const [hour, setHour] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const focusToParentInput = () => inputRef.current?.focus();

    return (
      <div style={{ position: "absolute", top: "10%" }}>
        <Calendar
          selected={selected}
          setSelected={setSelected}
          hour={hour}
          setHour={setHour}
          focusToParentInput={focusToParentInput}
        />
      </div>
    );
  },
};
