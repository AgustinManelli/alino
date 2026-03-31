"use client";

import { useCallback, useEffect, useState } from "react";
import { Crown } from "@/components/ui/icons/icons";
import { tierSatisfies } from "@/config/widgets.registry";
import { useDashboardStore } from "@/store/useDashboardStore";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { PredefinedWidget } from "@/lib/schemas/dashboard.types";
import { WindowComponent } from "@/components/ui/window-component";
import { getUserEmbeddedWidgets } from "@/lib/api/user-widgets/actions";

import { EmbeddedWidgetManager } from "./EmbeddedWidgetManager";
import styles from "./WidgetGallery.module.css";

type Tab = "catalog" | "community" | "my-widgets";

interface Props {
  onClose: () => void;
  userTier: "free" | "student" | "pro";
}

const TIER_LABELS: Record<string, string> = {
  free: "Gratis",
  student: "Estudiante",
  pro: "Pro",
};

const CATEGORY_LABELS: Record<string, string> = {
  productivity: "Productividad",
  wellness: "Bienestar",
  info: "Información",
  custom: "Personalizado",
};

export const WidgetGallery = ({ onClose, userTier }: Props) => {
  const [tab, setTab] = useState<Tab>("catalog");

  const predefinedWidgets = useDashboardStore((s) => s.predefinedWidgets);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const installWidget = useDashboardStore((s) => s.installWidget);
  const uninstallWidget = useDashboardStore((s) => s.uninstallWidget);

  const [communityWidgets, setCommunityWidgets] = useState<UserWidgetRow[]>([]);
  const [myEmbeddedWidgets, setMyEmbeddedWidgets] = useState<UserWidgetRow[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const fetchMyWidgets = useCallback(async () => {
    const { data } = await getUserEmbeddedWidgets();
    setMyEmbeddedWidgets(data ?? []);
  }, []);

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const { getCommunityWidgets } = await import(
        "@/lib/api/user-widgets/actions"
      );
      const { data } = await getCommunityWidgets();
      setCommunityWidgets(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "community") loadCommunity();
    if (tab === "my-widgets") fetchMyWidgets();
  }, [tab, loadCommunity, fetchMyWidgets]);

  const handleInstallPredefined = (def: PredefinedWidget) => {
    if (activeWidgets.includes(def.id)) {
      uninstallWidget(def.id);
    } else {
      installWidget(def.id);
    }
  };

  const handleInstallCommunity = (widget: UserWidgetRow) => {
    if (activeWidgets.includes(widget.id)) {
      uninstallWidget(widget.id);
    } else {
      useDashboardStore.getState().addEmbeddedWidgetToStore(widget);
    }
  };

  return (
    <WindowComponent
      windowTitle="Galería de widgets"
      id="widget-gallery-window"
      crossAction={onClose}
      adaptative={{ width: "720px", maxWidth: "90vw" }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.modeButtons}>
            <button
              type="button"
              className={`${styles.modeBtn} ${tab === "catalog" ? styles.active : ""}`}
              onClick={() => setTab("catalog")}
            >
              Catálogo
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${tab === "community" ? styles.active : ""}`}
              onClick={() => setTab("community")}
            >
              Comunidad
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${tab === "my-widgets" ? styles.active : ""}`}
              onClick={() => setTab("my-widgets")}
            >
              Mis Widgets
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {tab === "catalog" && (
            <div className={styles.grid}>
              {predefinedWidgets.map((def) => {
                const isInstalled = activeWidgets.includes(def.id);
                const canUse = tierSatisfies(userTier, def.tierRequired);
                const buttonLabel = isInstalled
                  ? "Desinstalar"
                  : !canUse
                    ? `Requiere ${TIER_LABELS[def.tierRequired]}`
                    : "Instalar";
                const buttonDisabled = !isInstalled && !canUse;
                const handleClick = () => {
                  if (isInstalled) {
                    uninstallWidget(def.id);
                  } else if (canUse) {
                    installWidget(def.id);
                  }
                };
                return (
                  <div
                    key={def.id}
                    className={`${styles.card} ${isInstalled ? styles.cardInstalled : ""} ${!canUse ? styles.cardLocked : ""}`}
                  >
                    <div className={styles.cardHeader}>
                      <div
                        className={styles.cardTierBadge}
                        data-tier={def.tierRequired}
                      >
                        {def.tierRequired !== "free" && (
                          <Crown
                            style={{
                              width: "15px",
                              height: "15px",
                              strokeWidth: 2,
                              stroke: "rgb(255, 200, 100)",
                            }}
                          />
                        )}
                        <span>{TIER_LABELS[def.tierRequired]}</span>
                      </div>
                      <span className={styles.cardCategory}>
                        {CATEGORY_LABELS[def.category] ?? def.category}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{def.name}</h3>
                    <p className={styles.cardDesc}>{def.description}</p>
                    <button
                      className={`${styles.cardAction} ${isInstalled ? styles.cardActionRemove : ""}`}
                      onClick={() => handleClick()}
                      disabled={buttonDisabled}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "community" && (
            <div>
              {loading ? (
                <div className={styles.emptyState}>
                  <p>Cargando widgets de la comunidad…</p>
                </div>
              ) : communityWidgets.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Aún no hay widgets públicos de la comunidad.</p>
                  <p className={styles.emptySubtext}>
                    Publica tus propios widgets desde &quot;Mis Widgets&quot;.
                  </p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {communityWidgets.map((w) => {
                    const isInstalled = activeWidgets.includes(w.id);
                    return (
                      <div
                        key={w.id}
                        className={`${styles.card} ${isInstalled ? styles.cardInstalled : ""}`}
                      >
                        <div className={styles.cardHeader}>
                          <span className={styles.cardCategory}>Embebido</span>
                        </div>
                        <h3 className={styles.cardTitle}>{w.title}</h3>
                        <p className={styles.cardDesc}>{w.url}</p>
                        <button
                          className={`${styles.cardAction} ${isInstalled ? styles.cardActionRemove : ""}`}
                          onClick={() => handleInstallCommunity(w)}
                        >
                          {isInstalled ? "Desinstalar" : "Instalar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "my-widgets" && (
            <EmbeddedWidgetManager
              widgets={myEmbeddedWidgets}
              activeWidgets={activeWidgets}
              userTier={userTier}
              onInstall={(id: string) => installWidget(id, id)}
              onUninstall={(id: string) => uninstallWidget(id)}
              onChange={fetchMyWidgets}
            />
          )}
        </div>
      </div>
    </WindowComponent>
  );
};
