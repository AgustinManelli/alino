import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EditTaskModal } from "./index";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import type { TaskType } from "@/lib/schemas/todo-schema";
import { TaskCardStatic } from "@/app/alino-app/components/todo/task-card/task-card-static";
import { useUserDataStore } from "@/store/useUserDataStore";

const meta: Meta<typeof EditTaskModal> = {
  title: "Components/EditTaskModal",
  component: EditTaskModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Modal de edición de tareas.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockTask: TaskType = {
  completed: false,
  created_at: new Date().toISOString(),
  created_by: {
    user_id: "test",
    display_name: "test",
    username: "test",
    avatar_url: "https://i.pravatar.cc/30",
  },
  description: "",
  index: 1,
  list_id: "storybook-list-456",
  target_date: new Date().toISOString(),
  task_content:
    "Este es el contenido de una tarea de prueba desde Storybook. Puedes ver cómo el modal se adapta a múltiples líneas.",
  task_id: "storybook-task-123",
  updated_at: null,
};

const ownTask: TaskType = {
  completed: false,
  created_at: new Date().toISOString(),
  created_by: {
    user_id: "owner",
    display_name: "owner",
    username: "owner",
    avatar_url: "https://i.pravatar.cc/1",
  },
  description: "",
  index: 1,
  list_id: "storybook-list-456",
  target_date: new Date().toISOString(),
  task_content:
    "Este es el contenido de una tarea de prueba desde Storybook. Puedes ver cómo el modal se adapta a múltiples líneas. Este es el contenido de una tarea de prueba desde Storybook. Puedes ver cómo el modal se adapta a múltiples líneas. Este es el contenido de una tarea de prueba desde Storybook. Puedes ver cómo el modal se adapta a múltiples líneas. Este es el contenido de una tarea de prueba desde Storybook. Puedes ver cómo el modal se adapta a múltiples líneas.",
  task_id: "storybook-task-1234",
  updated_at: null,
};

useTodoDataStore.setState({ tasks: [mockTask, ownTask] });

useUserDataStore.setState({
  user: {
    avatar_url: "https://i.pravatar.cc/30",
    biography: null,
    created_at: new Date().toISOString(),
    display_name: "",
    updated_at: null,
    user_id: "owner",
    username: "owner",
    user_private: {
      created_at: new Date().toISOString(),
      initial_guide_show: false,
      initial_username_prompt_shown: false,
      preferences: {},
      updated_at: null,
      user_id: "owner",
    },
  },
});

export const Default: Story = {
  render: () => {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          backgroundColor: "grey",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <section style={{ width: "90%" }}>
          <TaskCardStatic task={ownTask} />
        </section>
        <EditTaskModal />
      </div>
    );
  },
};

export const TareaDeOtroUsuario: Story = {
  render: () => {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          backgroundColor: "grey",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <section style={{ width: "90%" }}>
          <TaskCardStatic task={mockTask} />
        </section>
        <EditTaskModal />
      </div>
    );
  },
};
