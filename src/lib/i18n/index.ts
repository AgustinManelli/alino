import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import esCommon from "./locales/es/common.json";
import esShop from "./locales/es/shop.json";
import esCosmetics from "./locales/es/cosmetics.json";
import esStreak from "./locales/es/streak.json";
import esConfig from "./locales/es/config.json";
import esAssistant from "./locales/es/assistant.json";
import esAchievements from "./locales/es/achievements.json";
import enCommon from "./locales/en/common.json";
import enShop from "./locales/en/shop.json";
import enCosmetics from "./locales/en/cosmetics.json";
import enStreak from "./locales/en/streak.json";
import enConfig from "./locales/en/config.json";
import enAssistant from "./locales/en/assistant.json";
import enAchievements from "./locales/en/achievements.json";

export const defaultResources = {
  es: {
    common: esCommon,
    shop: esShop,
    cosmetics: esCosmetics,
    streak: esStreak,
    config: esConfig,
    assistant: esAssistant,
    achievements: esAchievements,
  },
  en: {
    common: enCommon,
    shop: enShop,
    cosmetics: enCosmetics,
    streak: enStreak,
    config: enConfig,
    assistant: enAssistant,
    achievements: enAchievements,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: defaultResources,
    lng: "es",
    fallbackLng: "es",
    defaultNS: "common",
    ns: ["common", "shop", "cosmetics", "streak", "config", "assistant", "achievements"],
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
