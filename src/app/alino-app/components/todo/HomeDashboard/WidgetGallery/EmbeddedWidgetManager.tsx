"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { useDashboardStore } from "@/store/useDashboardStore";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { useCreateEmbeddedWidget } from "@/hooks/dashboard/useCreateEmbeddedWidget";
import { useUpdateEmbeddedWidget } from "@/hooks/dashboard/useUpdateEmbeddedWidget";
import { useDeleteEmbeddedWidget } from "@/hooks/dashboard/useDeleteEmbeddedWidget";
import {
  Cross,
  Edit,
  Link,
  Information,
  AlinoLogo,
} from "@/components/ui/icons/icons";
import { Modal } from "@/components/ui/Modal";
import { customToast } from "@/lib/toasts";
import styles from "./EmbeddedWidgetManager.module.css";

interface Props {
  widgets: UserWidgetRow[];
  activeWidgets: string[];
  userTier: "free" | "student" | "pro" | "ultra";
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onChange?: () => void;
}

export const EmbeddedWidgetManager: React.FC<Props> = ({
  widgets,
  activeWidgets,
  userTier,
  onInstall,
  onUninstall,
  onChange,
}) => {
  const { t } = useTranslation(["widgets", "common"]);
  const { createWidget } = useCreateEmbeddedWidget();
  const { updateWidget } = useUpdateEmbeddedWidget();
  const { deleteWidget } = useDeleteEmbeddedWidget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<UserWidgetRow | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const widgetLimits = useDashboardStore((s) => s.widgetLimits);
  const limit = widgetLimits[userTier] ?? 1;
  const isLimitReached = widgets.length >= limit;

  const handleOpenCreate = () => {
    if (isLimitReached) {
      customToast.warning(
        t("widgets:myWidgetsSection.limitReachedTitle", {
          defaultValue: "Límite alcanzado",
        }),
        t("widgets:myWidgetsSection.limitReachedMsg", {
          limit,
          tier: userTier,
          defaultValue: `Has alcanzado el límite de ${limit} widget(s) para tu plan.`,
        }),
      );
      return;
    }
    setFormTitle("");
    setFormUrl("");
    setEditingWidget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (widget: UserWidgetRow) => {
    setFormTitle(widget.title);
    setFormUrl(widget.url ?? "");
    setEditingWidget(widget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingWidget(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formTitle.trim();
    const url = formUrl.trim();

    if (!title) {
      customToast.error(
        t("widgets:myWidgetsSection.titleRequired", {
          defaultValue: "El título es requerido.",
        }),
      );
      return;
    }

    if (!url) {
      customToast.error(
        t("widgets:myWidgetsSection.urlRequired", {
          defaultValue: "La URL es requerida.",
        }),
      );
      return;
    }

    if (!/^https:\/\/.+/i.test(url)) {
      customToast.error(
        t("widgets:myWidgetsSection.httpsRequired", {
          defaultValue: "La URL debe comenzar con https:// por seguridad.",
        }),
      );
      return;
    }

    setIsSaving(true);
    try {
      if (editingWidget) {
        const { error } = await updateWidget(editingWidget.id, {
          title,
          url,
        });
        if (error) return;
        customToast.success(
          t("widgets:myWidgetsSection.updatedSuccess", {
            defaultValue: "Widget actualizado correctamente.",
          }),
        );
      } else {
        const { error } = await createWidget({ title, url });
        if (error) return;
        customToast.success(
          t("widgets:myWidgetsSection.createdSuccess", {
            defaultValue: "Widget creado correctamente.",
          }),
        );
      }
      setIsModalOpen(false);
      onChange?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (widget: UserWidgetRow) => {
    const { error } = await deleteWidget(widget.id);
    if (error) return;
    customToast.success(
      t("widgets:myWidgetsSection.deletedSuccess", {
        defaultValue: "Widget eliminado.",
      }),
    );
    onChange?.();
  };

  const getDomainFromUrl = (url: string | null) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return url.replace(/^https?:\/\//, "").split("/")[0] || url;
    }
  };

  return (
    <div className={styles.manager}>
      <div className={styles.managerHeader}>
        <div className={styles.managerHeaderLeft}>
          <p className={styles.sectionTitle}>
            {t("widgets:myWidgetsSection.title", {
              defaultValue: "Tus widgets personalizados",
            })}
          </p>
          <p className={styles.sectionDescription}>
            {t("widgets:myWidgetsSection.subtitle", {
              defaultValue:
                "Herramientas externas, calendarios y dashboards en un solo lugar.",
            })}
          </p>
        </div>
        <button
          type="button"
          className={`${styles.btnCreate} ${
            isLimitReached ? styles.btnCreateDisabled : ""
          }`}
          onClick={handleOpenCreate}
        >
          <span>
            {isLimitReached
              ? t("widgets:myWidgetsSection.limitLabel", {
                  defaultValue: "Límite alcanzado",
                })
              : t("widgets:myWidgetsSection.newBtn", {
                  defaultValue: "+ Nuevo widget",
                })}
          </span>
        </button>
      </div>

      {isLimitReached && (
        <div className={styles.limitWarning}>
          {t("widgets:myWidgetsSection.limitNotice", {
            limit,
            tier: userTier,
            defaultValue: `Has alcanzado el límite de ${limit} widget(s) para tu plan ${userTier}.`,
          })}
        </div>
      )}

      {widgets.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Link style={{ width: 22, height: 22 }} />
          </div>
          <p className={styles.emptyTitle}>
            {t("widgets:myWidgetsSection.noWidgetsTitle", {
              defaultValue: "Aún no creaste ningún widget personalizado.",
            })}
          </p>
          <p className={styles.emptyDesc}>
            {t("widgets:myWidgetsSection.noWidgetsDesc", {
              defaultValue:
                "Embebe herramientas externas como Notion, Google Calendar, dashboards de métricas o calculadoras en tu espacio.",
            })}
          </p>
          {!isLimitReached && (
            <button
              type="button"
              className={styles.btnCreate}
              onClick={handleOpenCreate}
            >
              {t("widgets:myWidgetsSection.createFirstBtn", {
                defaultValue: "+ Crear primer widget",
              })}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {widgets.map((w) => {
            const isInstalled = activeWidgets.includes(w.id);
            const domain = getDomainFromUrl(w.url);

            return (
              <div
                key={w.id}
                className={`${styles.customWidgetCard} ${
                  isInstalled ? styles.customWidgetCardInstalled : ""
                }`}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.widgetTitle} title={w.title}>
                    {w.title}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      isInstalled ? styles.statusBadgeActive : ""
                    }`}
                  >
                    {isInstalled && <span className={styles.statusDot} />}
                    {isInstalled
                      ? t("widgets:myWidgetsSection.statusActive", {
                          defaultValue: "Activo",
                        })
                      : t("widgets:myWidgetsSection.statusReady", {
                          defaultValue: "Listo",
                        })}
                  </span>
                </div>

                <div className={styles.cardCenter}>
                  <div className={styles.browserMockup}>
                    <div className={styles.browserHeader}>
                      <span className={styles.browserDot} />
                      <span className={styles.browserDot} />
                      <span className={styles.browserDot} />
                    </div>
                    <div className={styles.browserUrlBar}>
                      <span className={styles.browserDomain}>
                        {domain || w.url}
                      </span>
                      {w.url && (
                        <a
                          href={w.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.openLinkBtn}
                          aria-label="Abrir enlace"
                        >
                          <Link style={{ width: 13, height: 13 }} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.cardActionsLeft}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => handleOpenEdit(w)}
                      aria-label={t("common:edit", { defaultValue: "Editar" })}
                    >
                      <Edit style={{ width: 14, height: 14 }} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => handleDelete(w)}
                      aria-label={t("common:delete", {
                        defaultValue: "Eliminar",
                      })}
                    >
                      <Cross style={{ width: 13, height: 13 }} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`${styles.installBtn} ${
                      isInstalled ? styles.installBtnRemove : ""
                    }`}
                    onClick={() =>
                      isInstalled ? onUninstall(w.id) : onInstall(w.id)
                    }
                  >
                    {isInstalled
                      ? t("widgets:uninstall", { defaultValue: "Desinstalar" })
                      : t("widgets:install", { defaultValue: "Instalar" })}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="500px"
        id="alino-custom-widget-modal"
        overlayStyle={{ zIndex: 130 }}
        ariaLabel={
          editingWidget
            ? t("widgets:myWidgetsSection.editWidgetModalTitle", {
                defaultValue: "Editar widget personalizado",
              })
            : t("widgets:myWidgetsSection.newWidgetModalTitle", {
                defaultValue: "Nuevo widget personalizado",
              })
        }
      >
        <Modal.Header bordered={true}>
          <div className={styles.modalHeaderBrand}>
            <div className={styles.modalLogo}>
              <AlinoLogo style={{ height: 22, width: "auto" }} />
            </div>
            <div className={styles.modalSeparator} />
            <span className={styles.modalTag}>
              {editingWidget
                ? t("widgets:myWidgetsSection.editTag", {
                    defaultValue: "EDITAR WIDGET",
                  })
                : t("widgets:myWidgetsSection.newTag", {
                    defaultValue: "NUEVO WIDGET",
                  })}
            </span>
          </div>
          <Modal.CloseButton onClick={handleCloseModal} />
        </Modal.Header>

        <form onSubmit={handleSave}>
          <Modal.Body noPadding={true}>
            <div className={styles.modalBody}>
              <div className={styles.modalFormHeader}>
                <h3 className={styles.modalFormTitle}>
                  {editingWidget
                    ? t("widgets:myWidgetsSection.editModalHeading", {
                        defaultValue: "Modificar widget",
                      })
                    : t("widgets:myWidgetsSection.newModalHeading", {
                        defaultValue: "Crear widget embebido",
                      })}
                </h3>
                <p className={styles.modalFormSubtitle}>
                  {t("widgets:myWidgetsSection.modalSubtitle", {
                    defaultValue:
                      "Introduce el nombre y la dirección HTTPS pública para integrar tu aplicación.",
                  })}
                </p>
              </div>

              <div className={styles.modalFormFields}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {t("widgets:myWidgetsSection.fieldTitle", {
                      defaultValue: "Nombre del widget",
                    })}
                  </label>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      className={styles.inputField}
                      placeholder={t(
                        "widgets:myWidgetsSection.placeholderTitle",
                        {
                          defaultValue: "Ej. Notion, Calendario, Métricas...",
                        },
                      )}
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      maxLength={60}
                      autoFocus
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>
                    {t("widgets:myWidgetsSection.fieldUrl", {
                      defaultValue: "URL del widget (HTTPS)",
                    })}
                  </label>
                  <div className={styles.inputContainer}>
                    <input
                      type="url"
                      className={styles.inputField}
                      placeholder="https://app.example.com/embed"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.infoBox}>
                  <Information
                    style={{ width: 16, height: 16 }}
                    className={styles.infoIcon}
                  />
                  <p className={styles.infoText}>
                    {t("widgets:myWidgetsSection.iframeSecurityNotice", {
                      defaultValue:
                        "El widget se cargará en un iframe aislado y seguro. Asegúrate de que el sitio permita embebido web (sin bloqueos X-Frame-Options o CSP restringido).",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer bordered={true}>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                {t("common:cancel", { defaultValue: "Cancelar" })}
              </button>
              <motion.button
                type="submit"
                className={styles.btnSubmit}
                disabled={isSaving}
                whileTap={{ scale: 0.97 }}
              >
                {isSaving
                  ? t("common:saving", { defaultValue: "Guardando..." })
                  : editingWidget
                    ? t("widgets:myWidgetsSection.btnUpdate", {
                        defaultValue: "Actualizar widget",
                      })
                    : t("widgets:myWidgetsSection.btnCreate", {
                        defaultValue: "Crear widget",
                      })}
              </motion.button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};
