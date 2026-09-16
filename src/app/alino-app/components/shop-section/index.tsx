"use client";

import React, { useRef, useState, useEffect } from "react";
import { useShopStore } from "@/store/useShopStore";
import { ModalBox } from "@/components/ui/modal-options-box";
import { ShopBagIcon } from "@/components/ui/icons/icons";
import { AlinoCoinIcon } from "@/components/ui/alino-coins-icon";
import { toast } from "sonner";
import styles from "./ShopSection.module.css";

export const ShopSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const iconRef = useRef<HTMLDivElement>(null);

  const {
    coins,
    coinPacks,
    isLoading,
    isRedeeming,
    fetchShopData,
    redeemPromoCode,
  } = useShopStore();

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        fetchShopData(true);
      }
      return next;
    });
  };

  const handleClose = () => setIsOpen(false);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim();
    if (!cleanCode) {
      toast.error("Ingresa un código promocional.");
      return;
    }

    const res = await redeemPromoCode(cleanCode);
    if (res.success) {
      toast.success(res.message || "¡Código canjeado con éxito!");
      setPromoCode("");
    } else {
      toast.error(res.error || "No se pudo canjear el código.");
    }
  };

  const headerSlot = (
    <div className={styles.headerSlot}>
      <span className={styles.title}>Alino Shop</span>
      <div className={styles.balanceBadge} title="Tus Alino Coins">
        <AlinoCoinIcon amount={coins} size={15} />
        <span>{coins}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div
        className={styles.triggerBtn}
        onClick={handleToggle}
        ref={iconRef}
        title="Alino Shop"
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
      >
        <AlinoCoinIcon amount={coins} size={22} />
        <span className={styles.coinsCount}>{coins}</span>
      </div>

      {isOpen && (
        <ModalBox
          onClose={handleClose}
          iconRef={iconRef}
          headerSlot={headerSlot}
        >
          <div className={styles.panel}>
            <section className={styles.promoSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Código promocional</span>
                <span className={styles.sectionSubtitle}>Obtené monedas</span>
              </div>
              <form className={styles.promoForm} onSubmit={handleRedeem}>
                <div className={styles.promoInputWrapper}>
                  <input
                    type="text"
                    className={styles.promoInput}
                    placeholder="Ej. ALINO100"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={isRedeeming}
                    maxLength={30}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.redeemBtn}
                  disabled={isRedeeming || !promoCode.trim()}
                >
                  {isRedeeming ? "Canjeando..." : "Canjear"}
                </button>
              </form>
            </section>

            <section className={styles.packsSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Packs de monedas</span>
                <span className={styles.sectionSubtitle}>Recargas</span>
              </div>

              <div className={styles.packsList}>
                {coinPacks.map((pack) => (
                  <div key={pack.id} className={styles.packCard}>
                    <div className={styles.packLeft}>
                      <AlinoCoinIcon amount={pack.coins_amount} size={22} />
                      <div className={styles.packInfo}>
                        <div className={styles.packNameRow}>
                          <span className={styles.packName}>{pack.name}</span>
                          {pack.tag && (
                            <span className={styles.packTag}>{pack.tag}</span>
                          )}
                        </div>
                        <span className={styles.packCoins}>
                          {pack.coins_amount} monedas
                        </span>
                      </div>
                    </div>

                    <div className={styles.packRight}>
                      <span className={styles.packPrice}>
                        USD ${Number(pack.price_usd).toFixed(2)}
                      </span>
                      <span className={styles.soonBadge}>Próximamente</span>
                    </div>
                  </div>
                ))}

                {coinPacks.length === 0 && !isLoading && (
                  <div className={styles.packCard}>
                    <div className={styles.packLeft}>
                      <AlinoCoinIcon amount={100} size={22} />
                      <div className={styles.packInfo}>
                        <span className={styles.packName}>Pack Monedas</span>
                        <span className={styles.packCoins}>100 monedas</span>
                      </div>
                    </div>
                    <div className={styles.packRight}>
                      <span className={styles.packPrice}>USD $1.99</span>
                      <span className={styles.soonBadge}>Próximamente</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ModalBox>
      )}
    </div>
  );
};
