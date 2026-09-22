"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { WindowComponent } from "@/components/ui/WindowComponent";
import {
  UserIcon,
  IAStars,
  TeamCollaborationIcon,
  ProtectorIcon,
  ReceiptIcon,
} from "@/components/ui/icons/icons";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useFetchProfileStats } from "@/hooks/user/useFetchProfileStats";
import { useFetchAIUsage } from "@/hooks/user/useFetchAIUsage";
import { useUploadAvatar } from "@/hooks/user/useUploadAvatar";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import {
  getActiveSubscription,
  cancelSubscriptionAction,
} from "@/lib/api/user/actions";
import { useModalStore } from "@/store/useModalStore";
import { customToast } from "@/lib/toasts";
import { ActiveSubscription } from "@/lib/schemas/user.types";
import { ProfileTab } from "./tabs/ProfileTab";
import { SubscriptionTab } from "./tabs/SubscriptionTab";
import { TransactionsTab } from "./tabs/TransactionsTab";
import { ReferralsTab } from "./tabs/ReferralsTab";
import { SecurityTab } from "./tabs/SecurityTab";
import styles from "./ConfigUser.module.css";

type TabType = "profile" | "subscription" | "transactions" | "referrals" | "security";

export default function ConfigUser() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isCroppingOpen, setIsCroppingOpen] = useState(false);

  const user = useUserDataStore((state) => state.user);
  const profileStats = useUserDataStore((state) => state.profileStats);
  const aiUsage = useUserDataStore((state) => state.aiUsage);
  const updateUser = useUserDataStore((state) => state.updateUser);
  const setConfigUserActive = useUserDataStore(
    (state) => state.setConfigUserActive,
  );

  const { fetchProfileStats } = useFetchProfileStats();
  const { fetchAIUsage } = useFetchAIUsage();
  const { uploadAvatar } = useUploadAvatar();
  const { updateProfile } = useUpdateProfile();
  const openModal = useModalStore((s) => s.open);

  const isFreeTier = !user?.tier || user.tier === "free";
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  useEffect(() => {
    fetchProfileStats();
    fetchAIUsage();
  }, [fetchProfileStats, fetchAIUsage]);

  useEffect(() => {
    if (!isFreeTier) {
      setLoadingSub(true);
      getActiveSubscription().then((res) => {
        if (res.data) setActiveSub(res.data);
        setLoadingSub(false);
      });
    }
  }, [isFreeTier]);

  const handleCancelSub = async () => {
    openModal({
      type: "confirmation",
      props: {
        text: "¿Estás seguro de que deseas cancelar tu suscripción?",
        additionalText:
          "Podrás disfrutar los beneficios hasta el final de tu período actual de facturación.",
        actionButton: "Cancelar suscripción",
        onConfirm: async () => {
          setLoadingCancel(true);
          const { data, error } = await cancelSubscriptionAction();
          if (error) {
            customToast.error(error);
          } else {
            if (data) customToast.success(data);
            setActiveSub((prev) =>
              prev
                ? { ...prev, cancel_at_period_end: true, status: "canceled" }
                : null,
            );
          }
          setLoadingCancel(false);
        },
      },
    });
  };

  const closeConfigModal = () => {
    if (isCroppingOpen) return;
    if (useModalStore.getState().stack.length > 0) return;

    const confirmationModal = document.getElementById(
      "confirmation-modal-my-account-config-modal",
    );
    if (confirmationModal) return;
    setConfigUserActive(false);
  };

  const handleOpenPremiumModal = () => {
    openModal({ type: "premium" });
  };

  const tierBadgeText =
    user?.tier && user.tier !== "free" ? user.tier.toUpperCase() : undefined;

  return (
    <WindowComponent
      windowTitle={"Mi cuenta"}
      id={"list-config-section"}
      crossAction={closeConfigModal}
      sidebar={
        <WindowComponent.Sidebar>
          <WindowComponent.SidebarItem
            label="Perfil"
            icon={
              <UserIcon
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "2",
                }}
              />
            }
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />
          <WindowComponent.SidebarItem
            label="Suscripción"
            icon={
              <IAStars
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "1.8",
                }}
              />
            }
            active={activeTab === "subscription"}
            onClick={() => setActiveTab("subscription")}
          />
          <WindowComponent.SidebarItem
            label="Historial de transacciones"
            icon={
              <ReceiptIcon
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "1.8",
                }}
              />
            }
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
          />
          <WindowComponent.SidebarItem
            label="Referidos"
            icon={
              <TeamCollaborationIcon
                style={{
                  width: "16px",
                  height: "16px",
                  color: "currentColor",
                }}
              />
            }
            active={activeTab === "referrals"}
            onClick={() => setActiveTab("referrals")}
          />
          <WindowComponent.SidebarItem
            label="Seguridad y privacidad"
            icon={
              <ProtectorIcon
                style={{
                  width: "16px",
                  height: "16px",
                  stroke: "currentColor",
                  strokeWidth: "1.8",
                }}
              />
            }
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
          />
        </WindowComponent.Sidebar>
      }
    >
      <div className={styles.configModalContainer}>
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <ProfileTab
              key="profile"
              user={user}
              profileStats={profileStats}
              uploadAvatar={uploadAvatar}
              updateProfile={updateProfile}
              onCropModalStateChange={setIsCroppingOpen}
            />
          )}

          {activeTab === "subscription" && (
            <SubscriptionTab
              key="subscription"
              user={user}
              aiUsage={aiUsage}
              activeSub={activeSub}
              loadingSub={loadingSub}
              loadingCancel={loadingCancel}
              onOpenPremiumModal={handleOpenPremiumModal}
              onCancelSub={handleCancelSub}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsTab
              key="transactions"
              user={user}
            />
          )}

          {activeTab === "referrals" && (
            <ReferralsTab
              key="referrals"
              user={user}
              updateUser={updateUser}
              fetchAIUsage={fetchAIUsage}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              key="security"
              user={user}
              updateUser={updateUser}
            />
          )}
        </AnimatePresence>
      </div>
    </WindowComponent>
  );
}
