import type { Preview } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/react";
import "../src/app/globals.css";
import "../src/components/ui/calendar/DayPicker.css";
import { inter } from "../src/lib/fonts";

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || "light";

  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }

  return (
    <div
      className={`${inter.className}`}
      data-theme={theme}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Story />
      <div id="portal-root"></div>
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    theme: {
      description: "Tema global",
      defaultValue: "light",
      toolbar: {
        title: "Tema",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "circlehollow", title: "Claro" },
          { value: "dark", icon: "circle", title: "Oscuro" },
          { value: "system", icon: "browser", title: "Sistema" },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
