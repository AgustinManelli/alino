export type SupportedRegion = string;

export interface FormattedRegionalPrice {
  currency: string;
  amount: number;
  formatted: string;
}

export interface RegionalPricingMap {
  [countryCode: string]: {
    currency: string;
    amount: number;
  };
}

export const formatCurrencyValue = (
  amount: number,
  currency: string,
  countryCode?: string
): string => {
  try {
    const hasDecimals = amount % 1 !== 0;
    const locale =
      countryCode && countryCode !== "GLOBAL"
        ? `es-${countryCode.toUpperCase()}`
        : "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currency} $${amount.toLocaleString()}`;
  }
};

export const resolveRegionalPrice = (
  regionalPrices?: RegionalPricingMap | null,
  countryCode?: string | null
): FormattedRegionalPrice => {
  const code = (countryCode || "AR").toUpperCase();

  if (regionalPrices && regionalPrices[code] && typeof regionalPrices[code].amount === "number") {
    const entry = regionalPrices[code];
    return {
      currency: entry.currency,
      amount: entry.amount,
      formatted: formatCurrencyValue(entry.amount, entry.currency, code),
    };
  }

  if (regionalPrices && regionalPrices["GLOBAL"] && typeof regionalPrices["GLOBAL"].amount === "number") {
    const entry = regionalPrices["GLOBAL"];
    return {
      currency: entry.currency,
      amount: entry.amount,
      formatted: formatCurrencyValue(entry.amount, entry.currency, "US"),
    };
  }

  return {
    currency: "USD",
    amount: 0,
    formatted: "$0.00",
  };
};

export const resolvePlanPrice = (
  plan: {
    regional_prices?: RegionalPricingMap | null;
  },
  countryCode?: string | null
): FormattedRegionalPrice => {
  return resolveRegionalPrice(plan.regional_prices, countryCode);
};
