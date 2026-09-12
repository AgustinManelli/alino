const REFERRAL_STORAGE_KEY = "alino_referral_code";

export const saveReferralCode = (code: string): void => {
  if (typeof window === "undefined" || !code) return;
  const cleanCode = code.trim().toUpperCase().replace(/^@/, "");
  if (!cleanCode) return;
  try {
    window.sessionStorage.setItem(REFERRAL_STORAGE_KEY, cleanCode);
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, cleanCode);
  } catch {
    return;
  }
};

export const getStoredReferralCode = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const sessionVal = window.sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    if (sessionVal) return sessionVal;

    const localVal = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (localVal) return localVal;

    const match = document.cookie.match(
      new RegExp("(^|;\\s*)alino_referral_code=([^;]*)"),
    );
    if (match && match[2]) return decodeURIComponent(match[2]);

    return null;
  } catch {
    return null;
  }
};

export const clearStoredReferralCode = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
    document.cookie = "alino_referral_code=; Max-Age=0; path=/;";
  } catch {
    return;
  }
};
