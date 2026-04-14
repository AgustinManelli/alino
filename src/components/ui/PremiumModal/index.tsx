"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
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
import { createClient } from "@/utils/supabase/client";

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
const AlertIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#f59e0b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const GiftIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

interface Props {
  onClose: () => void;
}

export const PremiumModal = ({ onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { user, updateUser } = useUserDataStore(
    useShallow((s) => ({ user: s.user, updateUser: s.updateUser })),
  );
  const [step, setStep] = useState<"plan" | "email">("plan");
  const [payerEmail, setPayerEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [trialDays, setTrialDays] = useState(30);
  const [offerPhaseDays, setOfferPhaseDays] = useState(90);
  const [trialEligible, setTrialEligible] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const isFree = !user?.tier || user.tier === "free";
  const offerPhaseMonths = Math.round(offerPhaseDays / 30);

  useEffect(() => {
    const fetchAuthEmail = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser?.email) setPayerEmail(authUser.email);
    };
    fetchAuthEmail();
  }, []);

  useEffect(() => {
    getAvailablePlansAction().then(({ data }) => {
      if (data) {
        setPlans(data);
        if (data.length > 0) setSelectedPlanId(data[0].id);
      }
      setLoadingPlans(false);
    });
  }, []);

  useEffect(() => {
    if (!isFree) return;
    checkTrialEligibility().then(({ data }) => {
      if (data) {
        setTrialEligible(data.eligible);
        setTrialDays(data.trial_days);
        setOfferPhaseDays(data.offer_phase_days);
      }
    });
  }, [isFree]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useOnClickOutside(ref, onClose);

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
      onClose();
    }
  };

  const handleNextStep = () => {
    if (!selectedPlanId) {
      toast.error("Por favor, seleccioná un plan primero.");
      return;
    }
    setStep("email");
  };

  const handlePaymentSubmit = async () => {
    if (!payerEmail.trim() || !payerEmail.includes("@")) {
      toast.error("Por favor ingresa un email válido.");
      return;
    }
    setLoadingPrimary(true);
    const { data, error } = await createCheckoutSessionAction(
      "mercadopago",
      selectedPlanId!,
      payerEmail.trim(),
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

  const normalPrice = selectedPlan ? Number(selectedPlan.price) : 0;
  const discountPct = selectedPlan?.discount_percentage || 0;
  const offerPrice =
    trialEligible && discountPct > 0
      ? Number((normalPrice * (1 - discountPct / 100)).toFixed(0))
      : normalPrice;

  return (
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
              onClick={onClose}
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

          <AnimatePresence mode="wait">
            {step === "plan" ? (
              <motion.div
                key="plan-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
              >
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

                {trialEligible && discountPct > 0 && (
                  <div className={styles.offerBanner}>
                    <GiftIcon />
                    <div className={styles.offerBannerText}>
                      <span className={styles.offerBannerTitle}>
                        {trialDays > 0
                          ? `${trialDays} días gratis`
                          : "Oferta de lanzamiento"}
                        {" · "}
                        {offerPhaseMonths} meses al {discountPct}% de descuento
                      </span>
                      <span className={styles.offerBannerSub}>
                        Luego ${normalPrice.toLocaleString("es-AR")} / mes ·
                        Cancelá cuando quieras
                      </span>
                    </div>
                  </div>
                )}

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
                          const pNormal = Number(plan.price);
                          const pDiscount = plan.discount_percentage || 0;
                          const pOffer =
                            trialEligible && pDiscount > 0
                              ? Number(
                                  (pNormal * (1 - pDiscount / 100)).toFixed(0),
                                )
                              : pNormal;
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
                                {trialEligible && pDiscount > 0 && (
                                  <span className={styles.discountBadge}>
                                    -{pDiscount}%
                                  </span>
                                )}
                              </div>
                              <div className={styles.planPriceContainer}>
                                <div className={styles.planPriceContainerItem}>
                                  <span className={styles.planCurrency}>
                                    {plan.currency}
                                  </span>
                                  <span className={styles.planPrice}>
                                    ${pOffer.toLocaleString("es-AR")}
                                  </span>
                                  <span className={styles.planPeriod}>
                                    /mes
                                  </span>
                                </div>

                                {/* {trialEligible && pDiscount > 0 && (
                                  <div
                                    className={styles.planPriceContainerItem}
                                  >
                                    <span className={styles.planNormalPrice}>
                                      Luego $ {pNormal.toLocaleString("es-AR")}
                                      /mes
                                    </span>
                                  </div>
                                )} */}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button
                      className={`${styles.primaryButton} ${trialEligible ? styles.primaryButtonTrial : ""}`}
                      onClick={handleNextStep}
                      disabled={loadingPlans}
                    >
                      {trialEligible && trialDays > 0
                        ? `Probar ${trialDays} días gratis`
                        : trialEligible && discountPct > 0
                          ? `Empezar con ${discountPct}% de descuento`
                          : "Continuar"}
                    </button>
                    <p className={styles.infoBottomText}>
                      Podés cancelar antes de que se facture el siguiente mes.
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
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCode()
                        }
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
            ) : (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }}
                className={styles.content}
              >
                <div className={styles.section}>
                  <button
                    className={styles.backBtn}
                    onClick={() => setStep("plan")}
                  >
                    ← Volver
                  </button>
                  <h3 className={styles.emailTitle}>
                    Confirma tu cuenta de Mercado Pago
                  </h3>
                  <div className={styles.alertBox}>
                    <AlertIcon />
                    <p>
                      La suscripción se creará en la cuenta de Mercado Pago
                      vinculada a este email.{" "}
                      <strong>Asegurate de que sea el correcto.</strong>
                    </p>
                  </div>
                  <label className={styles.emailLabel}>
                    Email de Mercado Pago
                  </label>
                  <input
                    type="email"
                    className={styles.promoInput}
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                  />

                  {/* Resumen de lo que va a pagar */}
                  {trialEligible && selectedPlan && (
                    <div className={styles.paymentSummary}>
                      {trialDays > 0 && (
                        <div className={styles.paymentSummaryRow}>
                          <span>Hoy</span>
                          <span className={styles.paymentSummaryFree}>
                            Gratis ({trialDays} días)
                          </span>
                        </div>
                      )}
                      {discountPct > 0 && (
                        <div className={styles.paymentSummaryRow}>
                          <span>Primeros {offerPhaseMonths} meses</span>
                          <span>
                            ${offerPrice.toLocaleString("es-AR")} / mes
                          </span>
                        </div>
                      )}
                      <div className={styles.paymentSummaryRow}>
                        <span>Luego</span>
                        <span>
                          ${normalPrice.toLocaleString("es-AR")} / mes
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    className={styles.primaryButton}
                    style={{ marginTop: "1rem" }}
                    onClick={handlePaymentSubmit}
                    disabled={loadingPrimary || !payerEmail.trim()}
                  >
                    {loadingPrimary ? (
                      <SpinnerIcon />
                    ) : (
                      "Ir a pagar en Mercado Pago"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </ClientOnlyPortal>
  );
};
