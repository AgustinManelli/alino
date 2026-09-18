export type SupportedLanguage = "es" | "en";

export interface LanguageOption {
  id: SupportedLanguage;
  label: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { id: "es", label: "Español" },
  { id: "en", label: "English" },
];

export const DEFAULT_LANGUAGE: SupportedLanguage = "es";
