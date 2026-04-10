"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { usePremiumModalStore } from "@/store/usePremiumModalStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import {
  redeemPromoCodeAction,
  createCheckoutSessionAction,
  getAvailablePlansAction,
  checkTrialEligibility,
} from "@/lib/api/user/actions";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import styles from "./PremiumModal.module.css";
import { AlinoLogo } from "../icons/icons";

const XIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const SpinnerIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    className={styles.spinner}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const PremiumModal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { isOpen, closePremiumModal } = usePremiumModalStore(
    useShallow((s) => ({
      isOpen: s.isOpen,
      closePremiumModal: s.closePremiumModal,
    })),
  );
  const { user, updateUser } = useUserDataStore(
    useShallow((s) => ({ user: s.user, updateUser: s.updateUser })),
  );

  const [promoCode, setPromoCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [trialDays, setTrialDays] = useState(30);
  const [trialEligible, setTrialEligible] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const isFree = !user?.tier || user.tier === "free";

  useEffect(() => {
    if (!isOpen) return;
    getAvailablePlansAction().then(({ data }) => {
      if (data) {
        setPlans(data);
        if (data.length > 0) setSelectedPlanId(data[0].id);
      }
      setLoadingPlans(false);
    });
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !isFree) return;
    checkTrialEligibility().then(({ data }) => {
      if (data) {
        setTrialEligible(data.eligible);
        setTrialDays(data.trial_days);
      }
    });
  }, [isOpen, isFree]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePremiumModal();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closePremiumModal]);

  useOnClickOutside(ref, () => {
    if (isOpen) closePremiumModal();
  });

  const handleApplyCode = async () => {
    if (!promoCode.trim()) return;
    setLoadingCode(true);
    const { data, error } = await redeemPromoCodeAction(
      promoCode.trim().toUpperCase(),
    );
    setLoadingCode(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(data?.message || "Código canjeado con éxito.");
      setPromoCode("");
      updateUser({ tier: (data?.granted_tier as any) ?? "pro" });
      closePremiumModal();
    }
  };

  const handlePrimaryAction = async () => {
    if (!selectedPlanId) {
      toast.error("Por favor, seleccioná un plan primero.");
      return;
    }
    setLoadingPrimary(true);

    const { data, error } = await createCheckoutSessionAction(
      "mercadopago",
      selectedPlanId,
    );
    if (error) {
      toast.error(error);
      setLoadingPrimary(false);
      return;
    }
    if (data?.url) {
      if (data.subscriptionId) {
        sessionStorage.setItem("pending_subscription_id", data.subscriptionId);
        sessionStorage.setItem("pending_subscription_gateway", "mercadopago");
      }
      window.location.href = data.url;
    } else {
      setLoadingPrimary(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <AnimatePresence>
      {isOpen && (
        <ClientOnlyPortal>
          <motion.div
            className={`${styles.premiumModalBackground} ignore-sidebar-close`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <motion.div
              className={styles.premiumModalContainer}
              ref={ref}
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                transition: { type: "spring", stiffness: 320, damping: 28 },
              }}
              exit={{
                scale: 0.95,
                y: 12,
                opacity: 0,
                transition: { duration: 0.15 },
              }}
            >
              <div className={styles.header}>
                <button
                  className={styles.closeButton}
                  onClick={closePremiumModal}
                  aria-label="Cerrar"
                >
                  <XIcon />
                </button>
                <div className={styles.proLogoContainer}>
                  <AlinoLogo style={{ width: "100px", height: "auto" }} />
                  <p>pro</p>
                </div>
                <p className={styles.subtitle}>
                  Lleva tu productividad al siguiente nivel.
                </p>
              </div>

              <ul className={styles.featureList}>
                {selectedPlan?.features?.map((f: string) => (
                  <li key={f} className={styles.featureItem}>
                    <span className={styles.checkIcon}>
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className={styles.content}>
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Elige tu Plan</h3>
                  {loadingPlans ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "0.5rem",
                      }}
                    >
                      <SpinnerIcon />
                    </div>
                  ) : (
                    <div className={styles.plansContainer}>
                      {plans.map((plan) => {
                        const finalPrice =
                          plan.price *
                          (1 - (plan.discount_percentage || 0) / 100);
                        const isSelected = selectedPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            className={`${styles.planCard} ${isSelected ? styles.planCardActive : ""}`}
                            onClick={() => setSelectedPlanId(plan.id)}
                          >
                            <div className={styles.planHeader}>
                              <span className={styles.planName}>
                                {plan.name}
                              </span>
                              {plan.discount_percentage > 0 && (
                                <span className={styles.discountBadge}>
                                  -{plan.discount_percentage}%
                                </span>
                              )}
                            </div>
                            <div className={styles.planPriceContainer}>
                              <span className={styles.planCurrency}>
                                {plan.currency}
                              </span>
                              <span className={styles.planPrice}>
                                ${finalPrice.toFixed(0)}
                              </span>
                              <span className={styles.planPeriod}>/mes</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    className={`${styles.primaryButton} ${trialEligible ? styles.primaryButtonTrial : ""}`}
                    onClick={handlePrimaryAction}
                    disabled={loadingPrimary || loadingPlans}
                  >
                    {loadingPrimary ? (
                      <SpinnerIcon />
                    ) : trialEligible ? (
                      `Empezar ${trialDays} días gratis`
                    ) : (
                      "Obtener Alino Pro"
                    )}
                  </button>
                  <p className={styles.infoBottomText}>
                    Puedes cancelar tu subscripción antes de facturar el
                    siguiente mes. <br />
                    Se te redirigirá a mercadopago.
                  </p>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>¿Tenés un código?</h3>
                  <div className={styles.promoContainer}>
                    <input
                      type="text"
                      className={styles.promoInput}
                      placeholder="Ej: ALINOCODE"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                      maxLength={40}
                    />
                    <button
                      className={styles.promoBtn}
                      disabled={!promoCode.trim() || loadingCode}
                      onClick={handleApplyCode}
                    >
                      {loadingCode ? <SpinnerIcon /> : "Canjear"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
