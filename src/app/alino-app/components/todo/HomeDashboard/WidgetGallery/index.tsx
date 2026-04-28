"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Crown } from "@/components/ui/icons/icons";
import { tierSatisfies } from "@/config/widgets.registry";
import { useInstallWidget } from "@/hooks/dashboard/useInstallWidget";
import { useUninstallWidget } from "@/hooks/dashboard/useUninstallWidget";
import { useDashboardStore } from "@/store/useDashboardStore";
import { UserWidgetRow } from "@/lib/schemas/database.types";
import { WindowComponent } from "@/components/ui/WindowComponent";
import { getUserEmbeddedWidgets } from "@/lib/api/user-widgets/actions";

import { EmbeddedWidgetManager } from "./EmbeddedWidgetManager";
import { Tabs, TabOption } from "@/components/ui/Tabs/Tabs";
import styles from "./WidgetGallery.module.css";
import { useModalStore } from "@/store/useModalStore";
import { WidgetPreview } from "./WidgetPreview";
import WIDGET_UI_META from "@/config/widgetUiMeta";

type Tab = "catalog" | "my-widgets";

interface Props {
  onClose: () => void;
  userTier: "free" | "student" | "pro" | "ultra";
}

const TIER_LABELS: Record<string, string> = {
  free: "Gratis",
  student: "Estudiante",
  pro: "Pro",
  ultra: "Ultra",
};

const CATEGORY_LABELS: Record<string, string> = {
  productivity: "Productividad",
  wellness: "Bienestar",
  info: "Información",
  custom: "Personalizado",
};

export const WidgetGallery = ({ onClose, userTier }: Props) => {
  const [tab, setTab] = useState<Tab>("catalog");
  const openModal = useModalStore((s) => s.open);

  const predefinedWidgets = useDashboardStore((s) => s.predefinedWidgets);
  const activeWidgets = useDashboardStore((s) => s.activeWidgets);
  const { installWidget, isPending: isInstalling } = useInstallWidget();
  const { uninstallWidget, isPending: isUninstalling } = useUninstallWidget();

  const [targetWidgetId, setTargetWidgetId] = useState<string | null>(null);

  const TABS: TabOption[] = useMemo(
    () => [
      { id: "catalog", label: "Catálogo" },
      { id: "my-widgets", label: "Mis Widgets" },
    ],
    [],
  );

  const [myEmbeddedWidgets, setMyEmbeddedWidgets] = useState<UserWidgetRow[]>(
    [],
  );

  const fetchMyWidgets = useCallback(async () => {
    const { data } = await getUserEmbeddedWidgets();
    setMyEmbeddedWidgets(data ?? []);
  }, []);

  useEffect(() => {
    if (tab === "my-widgets") fetchMyWidgets();
  }, [tab, fetchMyWidgets]);

  return (
    <WindowComponent
      windowTitle="Galería de widgets"
      id="widget-gallery-window"
      crossAction={onClose}
      adaptative={{ width: "720px", maxWidth: "90vw" }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <Tabs
            options={TABS}
            activeTab={tab}
            onChange={(id) => setTab(id as Tab)}
            layoutId="gallery-tabs"
          />
        </div>

        <div className={styles.content}>
          {tab === "catalog" && (
            <div className={styles.grid}>
              {predefinedWidgets.map((def) => {
                const isInstalled = activeWidgets.includes(def.id);
                const canUse = tierSatisfies(userTier, def.tierRequired);
                const isThisInstalling =
                  isInstalling && targetWidgetId === def.id;
                const isThisUninstalling =
                  isUninstalling && targetWidgetId === def.id;

                let buttonLabel = "";
                if (isInstalled)
                  buttonLabel = isThisUninstalling
                    ? "Desinstalando..."
                    : "Desinstalar";
                else if (isThisInstalling) buttonLabel = "Instalando...";
                else if (!canUse)
                  buttonLabel = `Requiere ${TIER_LABELS[def.tierRequired]}`;
                else buttonLabel = "Instalar";

                const buttonDisabled =
                  (!isInstalled && !canUse) ||
                  isThisInstalling ||
                  isThisUninstalling;

                const handleClick = async () => {
                  if (isThisInstalling || isThisUninstalling) return;
                  setTargetWidgetId(def.id);
                  try {
                    if (isInstalled) {
                      await uninstallWidget(def.id);
                    } else if (canUse) {
                      await installWidget(def.id);
                    } else {
                      handleOpenPremiumModal();
                    }
                  } finally {
                    setTargetWidgetId(null);
                  }
                };

                const handleOpenPremiumModal = () => {
                  openModal({ type: "premium" });
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
                    
                    <WidgetPreview componentKey={def.componentKey} title={def.name} />

                    <button
                      className={`${styles.cardAction} ${isInstalled ? styles.cardActionRemove : ""}`}
                      onClick={handleClick}
                      disabled={isThisInstalling || isThisUninstalling}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                );
              })}
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
