import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import esCommon from "./locales/es/common.json";
import esShop from "./locales/es/shop.json";
import esCosmetics from "./locales/es/cosmetics.json";
import esConfig from "./locales/es/config.json";
import enCommon from "./locales/en/common.json";
import enShop from "./locales/en/shop.json";
import enCosmetics from "./locales/en/cosmetics.json";
import enConfig from "./locales/en/config.json";

export const defaultResources = {
  es: {
    common: esCommon,
    shop: esShop,
    cosmetics: esCosmetics,
    config: esConfig,
  },
  en: {
    common: enCommon,
    shop: enShop,
    cosmetics: enCosmetics,
    config: enConfig,
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: defaultResources,
    lng: "es",
    fallbackLng: "es",
    defaultNS: "common",
    ns: ["common", "shop", "cosmetics", "config"],
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
