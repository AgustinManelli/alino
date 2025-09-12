// Calendar.stories.tsx
import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react"; // Importa StoryObj
import { Calendar } from "./index";
import "./Calendar.module.css";
import { inter } from "../../../lib/fonts";

// 1. Tipa el objeto meta
const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
  tags: ["autodocs"], // Habilita la documentación automática
};
export default meta;

// 2. Crea un tipo helper para tus historias
type Story = StoryObj<typeof meta>;

// 3. Convierte tus historias en objetos
export const Default: Story = {
  render: () => {
    // La lógica de estado ahora vive dentro de la función `render`
    const [selected, setSelected] = useState<Date | undefined>(undefined);
    const [hour, setHour] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const focusToParentInput = () => inputRef.current?.focus();

    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          gap: 16,
          alignItems: "flex-start",
          fontFamily: "inter",
          position: "absolute",
          top: 0,
        }}
        className={`${inter.className}`}
      >
        <Calendar
          selected={selected}
          setSelected={setSelected}
          hour={hour}
          setHour={setHour}
          focusToParentInput={focusToParentInput}
        />
        <div style={{ minWidth: 220, fontFamily: "inter" }}>
          <div>selected: {selected ? selected.toISOString() : "undefined"}</div>
          <div>hour: {hour ?? "undefined"}</div>
        </div>
      </div>
    );
  },
};

export const WithInitialValue: Story = {
  name: "With Initial Value", // Un nombre más descriptivo para la UI de Storybook
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date());
    const [hour, setHour] = useState<string | undefined>("10:00");

    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <Calendar
          selected={selected}
          setSelected={setSelected}
          hour={hour}
          setHour={setHour}
        />
        <div>
          <button
            onClick={() => {
              setSelected(undefined);
              setHour(undefined);
            }}
          >
            Clear
          </button>
        </div>
      </div>
    );
  },
};
