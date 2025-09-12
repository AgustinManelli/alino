"use client";

export const DATE_PRESETS = [
  {
    label: "Hoy",
    getDate: () => new Date(),
  },
  {
    label: "7 días",
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
  {
    label: "1 mes",
    getDate: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    },
  },
];

// Opciones para los botones de atajo de hora
export const TIME_PRESETS = [
  { label: "9 am", value: "09:00" },
  { label: "12 pm", value: "12:00" },
  { label: "5 pm", value: "17:00" },
];

export const HIGHLIGHT_COLOR = "#87189d";
