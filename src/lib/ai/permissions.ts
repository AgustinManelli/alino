import type { SubscriptionTier } from "@/lib/schemas/user.types";

export type { SubscriptionTier };

export type AIFeatureKey =
  | "assistant_chat"
  | "assistant_widget"
  | "task_generation"
  | "text_enhance"
  | "task_split";

export interface AIFeatureDefinition {
  key: AIFeatureKey;
  name: string;
  description: string;
  allowedTiers: readonly SubscriptionTier[];
  minTier: SubscriptionTier;
  upgradeMessage: string;
}

export const AI_FEATURE_REGISTRY: Record<AIFeatureKey, AIFeatureDefinition> = {
  assistant_chat: {
    key: "assistant_chat",
    name: "Asistente de IA (Chat)",
    description: "Asistente conversacional inteligente y agente de productividad con herramientas.",
    allowedTiers: ["pro", "ultra"] as const,
    minTier: "pro",
    upgradeMessage: "El Asistente de IA conversacional es exclusivo para usuarios con membresía Pro o Ultra.",
  },
  assistant_widget: {
    key: "assistant_widget",
    name: "Widget Asistente IA (Planificador)",
    description: "Creación estructurada y automática de listas, carpetas y tareas desde el dashboard.",
    allowedTiers: ["pro", "ultra"] as const,
    minTier: "pro",
    upgradeMessage: "El widget del Asistente IA es exclusivo para usuarios con membresía Pro o Ultra.",
  },
  task_generation: {
    key: "task_generation",
    name: "Generación de Tareas con IA",
    description: "Generación inteligente y estructuración de tareas a partir de un objetivo.",
    allowedTiers: ["pro", "ultra"] as const,
    minTier: "pro",
    upgradeMessage: "La generación automática de tareas es exclusiva para usuarios con membresía Pro o Ultra.",
  },
  text_enhance: {
    key: "text_enhance",
    name: "Mejora de Texto con IA",
    description: "Mejorar, resumir, expandir y corregir ortografía/estilo en tareas y notas.",
    allowedTiers: ["free", "student", "pro", "ultra"] as const,
    minTier: "free",
    upgradeMessage: "",
  },
  task_split: {
    key: "task_split",
    name: "Dividir Tarea con IA",
    description: "Dividir tareas complejas en pasos o subtareas manejables.",
    allowedTiers: ["free", "student", "pro", "ultra"] as const,
    minTier: "free",
    upgradeMessage: "",
  },
};

export function hasAIFeatureAccess(
  tier: string | null | undefined,
  feature: AIFeatureKey
): boolean {
  const normalizedTier = (tier?.toLowerCase() || "free") as SubscriptionTier;
  const config = AI_FEATURE_REGISTRY[feature];
  if (!config) return false;
  return config.allowedTiers.includes(normalizedTier);
}

export function getAIFeatureConfig(feature: AIFeatureKey): AIFeatureDefinition {
  return AI_FEATURE_REGISTRY[feature];
}
