import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./index";
import "./checkbox.module.css";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [status, setStatus] = useState<boolean>(false);

    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          gap: 16,
        }}
      >
        <Checkbox
          status={status}
          handleUpdateStatus={() => setStatus((s) => !s)}
          id={""}
        />
      </div>
    );
  },
};
