"use client";

import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { useCreateEmbeddedWidget } from "@/hooks/dashboard/useCreateEmbeddedWidget";
import { useUpdateEmbeddedWidget } from "@/hooks/dashboard/useUpdateEmbeddedWidget";
import { useDeleteEmbeddedWidget } from "@/hooks/dashboard/useDeleteEmbeddedWidget";
import { Cross, Edit, Share } from "@/components/ui/icons/icons";
import styles from "./EmbeddedWidgetManager.module.css";
import { customToast } from "@/lib/toasts";

interface Props {
  widgets: UserWidgetRow[];
  activeWidgets: string[];
  userTier: "free" | "student" | "pro" | "ultra";
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onChange?: () => void;
}

type Mode = "list" | "create" | "edit";

export const EmbeddedWidgetManager = ({
  widgets,
  activeWidgets,
  userTier,
  onInstall,
  onUninstall,
  onChange,
}: Props) => {
  const { createWidget } = useCreateEmbeddedWidget();
  const { updateWidget } = useUpdateEmbeddedWidget();
  const { deleteWidget } = useDeleteEmbeddedWidget();

  const [mode, setMode] = useState<Mode>("list");
  const [editing, setEditing] = useState<UserWidgetRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");

  const widgetLimits = useDashboardStore((s) => s.widgetLimits);
  const limit = widgetLimits[userTier] ?? 1;
  const isLimitReached = widgets.length >= limit;

  const openCreate = () => {
    if (isLimitReached) return;
    setFormTitle("");
    setFormUrl("");
    setEditing(null);
    setMode("create");
  };

  const openEdit = (widget: UserWidgetRow) => {
    setFormTitle(widget.title);
    setFormUrl(widget.url ?? "");
    setEditing(widget);
    setMode("edit");
  };

  const handleSave = async () => {
    const title = formTitle.trim();
    const url = formUrl.trim();

    if (!title) return customToast.error("El título es requerido.");
    if (!url) return customToast.error("La URL es requerida.");
    if (!/^https?:\/\/.+/.test(url))
      return customToast.error("La URL debe empezar con http:// o https://");

    setSaving(true);
    try {
      if (mode === "create") {
        const { error } = await createWidget({ title, url });
        if (error) return;
        customToast.success("Widget creado correctamente.");
        onChange?.();
      } else if (mode === "edit" && editing) {
        const { error } = await updateWidget(editing.id, {
          title,
          url,
        });
        if (error) return;
        customToast.success("Widget actualizado.");
        onChange?.();
      }
      setMode("list");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (widget: UserWidgetRow) => {
    const { error } = await deleteWidget(widget.id);
    if (error) return;
    customToast.success("Widget eliminado.");
    onChange?.();
  };

  if (mode === "create" || mode === "edit") {
    return (
      <div className={styles.formContainer}>
        <div className={styles.sectionContainer}>
          <p className={styles.sectionTitle}>
            {mode === "create" ? "CREAR NUEVO WIDGET" : "EDITAR WIDGET"}
          </p>
          <div className={styles.sectionContent}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>TÍTULO</label>
              <input
                className={styles.input}
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Nombre del widget"
                maxLength={60}
              />
            </div>
            <div className={styles.configElementSeparator} />
            <div className={styles.inputGroup}>
              <label className={styles.label}>URL DEL WIDGET</label>
              <input
                className={styles.input}
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://ejemplo.com/widget"
              />
            </div>
          </div>
          <p className={styles.sectionDescription}>
            El widget se mostrará en un iframe seguro. Asegúrate de que la URL
            permita ser embebida.
          </p>
        </div>

        <div className={styles.formActions}>
          <button
            className={styles.btnSecondary}
            onClick={() => setMode("list")}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.manager}>
      <div className={styles.sectionContainer}>
        <div className={styles.managerHeader}>
          <p className={styles.sectionTitle}>TUS WIDGETS PERSONALIZADOS</p>
          <button
            className={styles.btnCreate}
            onClick={openCreate}
            disabled={isLimitReached}
          >
            {isLimitReached ? "Límite alcanzado" : "+ Nuevo widget"}
          </button>
        </div>

        {isLimitReached && (
          <p
            className={styles.sectionDescription}
            style={{ color: "rgb(255, 180, 0)" }}
          >
            Has alcanzado el límite de {limit} widget{limit > 1 ? "s" : ""} para
            tu cuenta {userTier === "free" ? "Gratis" : "Estudiante"}.
          </p>
        )}

        {widgets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Aún no creaste ningún widget embebido.</p>
            <p className={styles.emptySubtext}>
              Embebe herramientas externas, dashboards o calendarios.
            </p>
          </div>
        ) : (
          <div className={styles.sectionContent}>
            {widgets.map((w, index) => {
              const isInstalled = activeWidgets.includes(w.id);
              return (
                <div key={w.id} className={styles.widgetWrapper}>
                  <div className={styles.sectionElement}>
                    <div className={styles.widgetInfo}>
                      <span className={styles.widgetTitle}>
                        {w.title}
                        {isInstalled && <span className={styles.dotActive} />}
                      </span>
                      <span className={styles.widgetUrl}>{w.url}</span>
                    </div>
                    <div className={styles.widgetActions}>
                      <button
                        className={`${styles.installBtn} ${isInstalled ? styles.isInstalled : ""}`}
                        title={isInstalled ? "Desinstalar" : "Instalar"}
                        onClick={() =>
                          isInstalled ? onUninstall(w.id) : onInstall(w.id)
                        }
                      >
                        {isInstalled ? "Remover" : "Instalar"}
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEdit(w)}
                      >
                        <Edit style={{ width: "14px" }} />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.btnDanger}`}
                        onClick={() => handleDelete(w)}
                      >
                        <Cross style={{ width: "13px" }} />
                      </button>
                    </div>
                  </div>
                  {index < widgets.length - 1 && (
                    <div className={styles.configElementSeparator} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
