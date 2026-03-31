"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  createEmbeddedWidget,
  updateEmbeddedWidget,
  deleteEmbeddedWidget,
  toggleWidgetPublic,
} from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { Cross, Edit, Share } from "@/components/ui/icons/icons";
import styles from "./EmbeddedWidgetManager.module.css";

interface Props {
  widgets: UserWidgetRow[];
  activeWidgets: string[];
  userTier: "free" | "student" | "pro";
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onChange?: () => void;
}

const TIER_LIMITS = {
  free: 1,
  student: 3,
  pro: Infinity,
};

type Mode = "list" | "create" | "edit";

export const EmbeddedWidgetManager = ({
  widgets,
  activeWidgets,
  userTier,
  onInstall,
  onUninstall,
  onChange,
}: Props) => {
  const addEmbedded = useDashboardStore((s) => s.addEmbeddedWidgetToStore);
  const updateEmbedded = useDashboardStore(
    (s) => s.updateEmbeddedWidgetInStore,
  );
  const removeEmbedded = useDashboardStore(
    (s) => s.removeEmbeddedWidgetFromStore,
  );

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

    if (!title) return toast.error("El título es requerido.");
    if (!url) return toast.error("La URL es requerida.");
    if (!/^https?:\/\/.+/.test(url))
      return toast.error("La URL debe empezar con http:// o https://");

    setSaving(true);
    try {
      if (mode === "create") {
        const { data, error } = await createEmbeddedWidget({ title, url });
        if (error || !data) throw new Error(error ?? "Error desconocido");
        addEmbedded(data);
        toast.success("Widget creado correctamente.");
        onChange?.();
      } else if (mode === "edit" && editing) {
        const { data, error } = await updateEmbeddedWidget(editing.id, {
          title,
          url,
        });
        if (error || !data) throw new Error(error ?? "Error desconocido");
        updateEmbedded(editing.id, { title, url });
        toast.success("Widget actualizado.");
        onChange?.();
      }
      setMode("list");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (widget: UserWidgetRow) => {
    const { error } = await deleteEmbeddedWidget(widget.id);
    if (error) return toast.error(error);
    removeEmbedded(widget.id);
    toast.success("Widget eliminado.");
    onChange?.();
  };

  const handleTogglePublic = async (widget: UserWidgetRow) => {
    const next = !widget.is_public;
    const { data, error } = await toggleWidgetPublic(widget.id, next);
    if (error || !data)
      return toast.error(error ?? "Error al cambiar visibilidad.");
    updateEmbedded(widget.id, { is_public: next });
    toast.success(
      next
        ? "Widget publicado en la comunidad."
        : "Widget ocultado de la comunidad.",
    );
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
                        title={w.is_public ? "Ocultar" : "Publicar"}
                        onClick={() => handleTogglePublic(w)}
                      >
                        <Share
                          style={{
                            width: "14px",
                            opacity: w.is_public ? 1 : 0.4,
                          }}
                        />
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
