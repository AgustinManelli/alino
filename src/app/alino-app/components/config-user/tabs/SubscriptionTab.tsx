"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  IAStars,
  Colaborate,
  FolderClosed,
  Crown,
} from "@/components/ui/icons/icons";
import { UserType } from "@/lib/schemas/database.types";
import { FeatureUsage, ActiveSubscription } from "@/lib/schemas/user.types";
import { redeemPromoCodeAction } from "@/lib/api/user/actions";
import { customToast } from "@/lib/toasts";
import styles from "../ConfigUser.module.css";

interface SubscriptionTabProps {
  user: UserType | null;
  aiUsage: FeatureUsage | null;
  activeSub: ActiveSubscription | null;
  loadingSub: boolean;
  loadingCancel: boolean;
  onOpenPremiumModal: () => void;
  onCancelSub: () => void;
}

export function SubscriptionTab({
  user,
  aiUsage,
  activeSub,
  loadingSub,
  loadingCancel,
  onOpenPremiumModal,
  onCancelSub,
}: SubscriptionTabProps) {
  const isFreeTier = !user?.tier || user.tier === "free";
  const [promoCode, setPromoCode] = useState("");
  const [loadingPromo, setLoadingPromo] = useState(false);

  const isUnlimited = aiUsage ? aiUsage.limit >= 9999999 : false;
  const usedPct =
    aiUsage && !isUnlimited
      ? Math.min((aiUsage.used / aiUsage.limit) * 100, 100)
      : 0;
  const remainingPct =
    aiUsage && !isUnlimited
      ? Math.max((aiUsage.remaining / aiUsage.limit) * 100, 0)
      : 0;

  const isNearLimit = usedPct >= 80 && !isUnlimited;
  const isExhausted = aiUsage ? aiUsage.remaining === 0 && !isUnlimited : false;

  const renewDate = aiUsage?.period_end
    ? new Date(aiUsage.period_end).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    setLoadingPromo(true);
    const { data, error } = await redeemPromoCodeAction(clean);
    setLoadingPromo(false);

    if (error) {
      customToast.error(error);
    } else {
      customToast.success(data?.message || "¡Código promocional canjeado!");
      setPromoCode("");
    }
  };

  const PRO_BENEFITS = [
    {
      title: "Inteligencia Artificial Ilimitada",
      desc: "Hasta 500 créditos mensuales para desglosar subtareas, mejorar notas y organizar listas.",
      icon: <IAStars style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
    {
      title: "Widgets y Panel Exclusivo",
      desc: "Desbloquea todos los widgets de productividad para tu pantalla de inicio personalizada.",
      icon: <Crown style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
    {
      title: "Colaboración en Tiempo Real",
      desc: "Comparte y gestiona listas con tus compañeros de equipo sin límites de miembros.",
      icon: <Colaborate style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
    {
      title: "Carpetas y Fijación Avanzada",
      desc: "Organización jerárquica ilimitada y fija tus proyectos clave en la barra lateral.",
      icon: <FolderClosed style={{ width: 15, height: 15, stroke: "currentColor" }} />,
    },
  ];

  return (
    <motion.div
      className={styles.tabContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.tabHeaderBlock}>
        <h3 className={styles.tabSectionTitle}>Suscripción y Beneficios</h3>
        <p className={styles.tabSectionSubtitle}>
          Descubre el potencial de tu cuenta, gestiona tu plan y controla tu consumo de IA.
        </p>
      </div>

      {isFreeTier ? (
        <div className={styles.upgradeBanner}>
          <div className={styles.upgradeBannerContent}>
            <span className={styles.upgradeEmoji}>✦</span>
            <div>
              <p className={styles.upgradeBannerTitle}>Alino Pro — Productividad Sin Límites</p>
              <p className={styles.upgradeBannerDesc}>
                Acceso completo a Inteligencia Artificial, widgets ilimitados y funciones avanzadas para tus proyectos.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPremiumModal}
            className={styles.upgradeBannerBtn}
            type="button"
          >
            Explorar planes
          </button>
        </div>
      ) : (
        <div
          className={styles.upgradeBanner}
          style={{ background: "var(--background-over-container)" }}
        >
          <div className={styles.upgradeBannerContent}>
            <span className={styles.upgradeEmoji}>✦</span>
            <div>
              <p className={styles.upgradeBannerTitle}>
                Suscripción {user?.tier?.toUpperCase()} Activa
              </p>
              <p
                className={styles.upgradeBannerDesc}
                style={{
                  color: "var(--text-not-available)",
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                {loadingSub
                  ? "Cargando información..."
                  : activeSub?.gateway === "promo" ||
                    activeSub?.gateway === "manual" ||
                    activeSub?.gateway === "referral"
                    ? `Termina el ${activeSub?.current_period_end
                      ? new Date(activeSub.current_period_end).toLocaleDateString("es-AR")
                      : ""
                    }`
                    : activeSub?.cancel_at_period_end ||
                      activeSub?.status === "canceled" ||
                      activeSub?.status === "free"
                      ? `Se cancelará el ${activeSub?.current_period_end
                        ? new Date(activeSub.current_period_end).toLocaleDateString("es-AR")
                        : ""
                      }`
                      : activeSub?.current_period_end
                        ? `Renueva el ${new Date(activeSub.current_period_end).toLocaleDateString(
                          "es-AR"
                        )}`
                        : "Tu cuenta cuenta con todos los beneficios Pro activos."}
              </p>
            </div>
          </div>
          {activeSub &&
            (activeSub.gateway === "referral" ||
              activeSub.gateway === "promo" ||
              activeSub.gateway === "manual") && (
              <button
                onClick={onOpenPremiumModal}
                className={styles.upgradeBannerBtn}
                type="button"
              >
                Suscribirme
              </button>
            )}
          {activeSub &&
            !activeSub.cancel_at_period_end &&
            activeSub.status !== "canceled" &&
            activeSub.status !== "free" &&
            activeSub.gateway === "mercadopago" && (
              <button
                onClick={onCancelSub}
                className={styles.upgradeBannerBtn}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
                disabled={loadingCancel}
                type="button"
              >
                {loadingCancel ? "..." : "Cancelar suscripción"}
              </button>
            )}
        </div>
      )}

      <section className={styles.aiCreditsSection}>
        <div className={styles.aiCreditsSectionHeader}>
          <IAStars
            style={{
              width: "14px",
              height: "14px",
              stroke: "var(--icon-colorv2)",
              opacity: 0.8,
            }}
          />
          <h4 className={styles.aiCreditsSectionTitle}>
            Créditos de Inteligencia Artificial
          </h4>
        </div>

        <div className={styles.aiCreditsCard}>
          <div className={styles.aiCreditsRow}>
            <div className={styles.aiCreditsInfo}>
              <span className={styles.aiCreditsLabel}>Créditos disponibles este período</span>
              {aiUsage ? (
                <span className={styles.aiCreditsCount}>
                  {isUnlimited ? (
                    <span className={styles.aiCreditsUnlimited}>Ilimitados ✦</span>
                  ) : (
                    <>
                      <span
                        className={styles.aiCreditsUsed}
                        style={{
                          color: isExhausted
                            ? "#ef4444"
                            : isNearLimit
                              ? "#f59e0b"
                              : "var(--text)",
                        }}
                      >
                        {aiUsage.remaining}
                      </span>
                      <span className={styles.aiCreditsTotal}>
                        {" "}
                        / {aiUsage.limit}
                      </span>
                    </>
                  )}
                </span>
              ) : (
                <span className={styles.aiCreditsLoading}>Cargando cuotas...</span>
              )}
            </div>

            {renewDate && !isUnlimited && (
              <span className={styles.aiCreditsRenew}>
                Renueva el {renewDate}
              </span>
            )}
          </div>

          {!isUnlimited && aiUsage && (
            <div className={styles.aiCreditsBarTrack}>
              <motion.div
                className={styles.aiCreditsBarFill}
                initial={{ width: "100%" }}
                animate={{ width: `${remainingPct}%` }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.15,
                }}
                style={{
                  background: isExhausted
                    ? "rgba(239, 68, 68, 0.7)"
                    : isNearLimit
                      ? "linear-gradient(90deg, rgba(245, 158, 11, 0.8), rgba(239, 68, 68, 0.6))"
                      : "linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.6))",
                }}
              />
            </div>
          )}

          {isExhausted && (
            <p className={styles.aiCreditsWarning}>
              Has alcanzado el límite de créditos para este período. Se renovarán automáticamente en la fecha indicada.
            </p>
          )}
          {isNearLimit && !isExhausted && (
            <p className={styles.aiCreditsWarning} style={{ color: "#f59e0b" }}>
              Quedan pocos créditos disponibles. Puedes actualizar tu plan o esperar a la renovación.
            </p>
          )}
        </div>
      </section>

      <div className={styles.sectionDivider} />

      <section className={styles.featuresSection}>
        <h4 className={styles.tabSectionTitle} style={{ fontSize: "14px" }}>
          Beneficios incluidos en Alino Pro
        </h4>
        <div className={styles.featuresGrid}>
          {PRO_BENEFITS.map((b, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIconBox}>{b.icon}</div>
              <div className={styles.featureContent}>
                <p className={styles.featureTitle}>{b.title}</p>
                <p className={styles.featureDesc}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.promoSection}>
        <div className={styles.promoHeader}>
          <Crown style={{ width: "15px", height: "15px", stroke: "var(--alino-primary-color)" }} />
          <h4 className={styles.promoTitle}>¿Tienes un código de promoción?</h4>
        </div>
        <form onSubmit={handleApplyPromo} className={styles.promoForm}>
          <input
            type="text"
            className={styles.promoInput}
            placeholder="INGRESA TU CÓDIGO (EJ. PRO30D)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            disabled={loadingPromo}
            maxLength={20}
          />
          <button
            type="submit"
            className={styles.promoBtn}
            disabled={loadingPromo || !promoCode.trim()}
          >
            {loadingPromo ? "Canjeando..." : "Aplicar"}
          </button>
        </form>
      </section>

      <div className={styles.sectionDivider} />

      <section className={styles.faqSection}>
        <h4 className={styles.tabSectionTitle} style={{ fontSize: "14px" }}>
          Preguntas frecuentes
        </h4>
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>¿Puedo cancelar en cualquier momento?</p>
          <p className={styles.faqAnswer}>
            Sí, puedes cancelar cuando desees con un solo clic. Conservarás todos los beneficios Pro hasta el final del período ya facturado.
          </p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>¿Qué métodos de pago aceptan?</p>
          <p className={styles.faqAnswer}>
            Aceptamos Mercado Pago, tarjetas de crédito, débito y transferencias locales bancarias seguras.
          </p>
        </div>
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>¿Qué sucede con mis datos y listas si vuelvo al plan Free?</p>
          <p className={styles.faqAnswer}>
            Absolutamente ninguna información se pierde. Todas tus listas, tareas y notas permanecerán intactas y seguras.
          </p>
        </div>
      </section>
    </motion.div>
  );
}
