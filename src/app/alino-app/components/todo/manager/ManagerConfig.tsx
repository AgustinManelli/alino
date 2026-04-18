"use client";

import { memo, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSetTaskSort } from "@/hooks/todo/tasks/useSetTaskSort";
import { useDeleteList } from "@/hooks/todo/lists/useDeleteList";
import { useLeaveList } from "@/hooks/todo/lists/useLeaveList";
import { useModalStore } from "@/store/useModalStore";
import { ListsType } from "@/lib/schemas/database.types";
import { ConfigMenu, ConfigOption } from "@/components/ui/ConfigMenu";
import { Dropdown } from "@/components/ui/Dropdown";

import {
  DeleteIcon,
  Edit,
  Information,
  LogOut,
  Check,
  DefaultSortIcon,
  DueAscSortIcon,
  DueDescSortIcon,
  AlphaAscSortIcon,
  AlphaDescSortIcon,
  DragIcon,
  TaskDoneIcon,
} from "@/components/ui/icons/icons";
import styles from "./manager.module.css";

const SORT_OPTIONS = [
  { value: "default", label: "Por defecto", icon: DefaultSortIcon },
  { value: "due_asc", label: "Fecha (asc.)", icon: DueAscSortIcon },
  { value: "due_desc", label: "Fecha (desc.)", icon: DueDescSortIcon },
  { value: "alpha_asc", label: "Nomb. (asc.)", icon: AlphaAscSortIcon },
  { value: "alpha_desc", label: "Nomb. (desc.)", icon: AlphaDescSortIcon },
] as const;

const EDIT_ICON = <Edit className={styles.iconStyle} />;
const REORDER_ICON = <DragIcon className={styles.iconStyle} />;
const DELETE_ICON = <DeleteIcon className={styles.iconStyle} />;
const LOGOUT_ICON = <LogOut className={styles.iconStyle} />;
const INFO_ICON = <Information className={styles.iconStyle} />;

interface ManagerConfigProps {
  setList?: ListsType;
  showCompleted: boolean;
  handleToggleCompleted: () => void;
  isReordering: boolean;
  setIsReordering: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNameChange: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ManagerConfig = memo(function ManagerConfig({
  setList,
  showCompleted,
  handleToggleCompleted,
  isReordering,
  setIsReordering,
  setIsNameChange,
}: ManagerConfigProps) {
  const taskSort = useTodoDataStore((state) => state.taskSort);

  const { setTaskSort } = useSetTaskSort();
  const { deleteList } = useDeleteList();
  const { leaveList } = useLeaveList();
  const openModal = useModalStore((s) => s.open);

  const { canDelete, canEdit, isNotOwner } = useMemo(() => {
    const role = setList?.role;
    return {
      canDelete: role === "owner" || role === "admin",
      canEdit: role === "owner" || role === "admin",
      isNotOwner: role !== "owner",
    };
  }, [setList?.role]);

  const handleConfirmDelete = useCallback(() => {
    openModal({
      type: "confirmation",

      props: {
        text: `¿Desea eliminar la lista "${setList?.list.list_name}"?`,
        onConfirm: () => setList && deleteList(setList.list_id),
        additionalText:
          "Esta acción es irreversible y eliminará todas las tareas de la lista.",
      },
    });
  }, [openModal, setList, deleteList]);

  const handleConfirmLeave = useCallback(() => {
    openModal({
      type: "confirmation",

      props: {
        text: `¿Desea salir de la lista "${setList?.list.list_name}"?`,
        onConfirm: () => setList && leaveList(setList.list_id),
        additionalText: "Puedes regresar a ella con otra invitación.",
        actionButton: "Salir",
      },
    });
  }, [openModal, setList, leaveList]);

  const configOptions = useMemo((): ConfigOption[] => {
    return [
      {
        name: "Editar",
        icon: EDIT_ICON,
        action: () => setIsNameChange(true),
        enabled: canEdit,
      },
      {
        name: isReordering ? "Fin de reordenar" : "Reordenar tareas",
        icon: REORDER_ICON,
        action: () => setIsReordering((prev) => !prev),
        enabled: canEdit && taskSort === "default" && !showCompleted,
      },
      {
        name: "Eliminar lista",
        icon: DELETE_ICON,
        action: handleConfirmDelete,
        enabled: canDelete,
      },
      {
        name: "Avanzado",
        icon: "",
        children: [
          {
            name: "Duplicar lista",
            icon: "",
            action: () => {},
            enabled: canDelete,
          },
          {
            name: "Desmarcar todas",
            icon: "",
            action: () => {},
            enabled: canDelete,
          },
          {
            name: "Limpiar completadas",
            icon: "",
            action: () => {},
            enabled: canDelete,
          },
          {
            name: "Vaciar lista",
            icon: "",
            action: () => {},
            enabled: canDelete,
          },
        ],
      },
      {
        name: "Salir de la lista",
        icon: LOGOUT_ICON,
        action: handleConfirmLeave,
        enabled: isNotOwner,
      },
      {
        name: "Información",
        icon: INFO_ICON,
        action: () =>
          setList &&
          openModal({ type: "listInformation", props: { list: setList } }),
        enabled: true,
      },
    ].filter(Boolean) as ConfigOption[];
  }, [
    canEdit,
    canDelete,
    isReordering,
    taskSort,
    showCompleted,
    handleConfirmDelete,
    handleConfirmLeave,
    setIsReordering,
  ]);

  return (
    <div className={styles.configSection}>
      <AnimatePresence mode="wait">
        {isReordering ? (
          <motion.button
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsReordering(false)}
            title={"Finalizar reordenamiento"}
            className={styles.checkButton}
          >
            <Check
              style={{
                width: "16px",
                height: "auto",
                stroke: "var(--text)",
                strokeWidth: 2,
              }}
            />
            Finalizar
          </motion.button>
        ) : (
          <div key="options" className={styles.options}>
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ delay: 0.05 }}
              onClick={handleToggleCompleted}
              title={
                showCompleted
                  ? "Salir de las tareas completadas"
                  : "Ver tareas completadas"
              }
              className={`${styles.trashButton} ${showCompleted ? styles.trashButtonActive : ""}`}
            >
              <TaskDoneIcon
                style={{
                  width: "18px",
                  height: "18px",
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                }}
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ delay: 0.1 }}
            >
              <Dropdown>
                <Dropdown.Trigger
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "7px",
                    color: "var(--text)",
                    padding: 0,
                  }}
                >
                  {(() => {
                    const Icon =
                      SORT_OPTIONS.find((o) => o.value === taskSort)?.icon ||
                      DefaultSortIcon;
                    return (
                      <Icon
                        style={{
                          width: "18px",
                          height: "18px",
                          strokeWidth: 2,
                        }}
                      />
                    );
                  })()}
                </Dropdown.Trigger>
                <Dropdown.Content>
                  {SORT_OPTIONS.map((opt) => (
                    <Dropdown.Item
                      key={opt.value}
                      onClick={() => setTaskSort(opt.value)}
                      isActive={taskSort === opt.value}
                    >
                      <opt.icon
                        style={{
                          width: "16px",
                          height: "16px",
                          strokeWidth: 2,
                        }}
                      />
                      {opt.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Content>
              </Dropdown>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{ delay: 0.15 }}
            >
              <ConfigMenu iconWidth={"25px"} configOptions={configOptions} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
