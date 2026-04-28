/**
 * widgets.registry.ts
 *
 * Utilidades compartidas del sistema de widgets.
 *
 * Los registros de componentes e iconos están en:
 *   - @/config/widgetComponents.ts  → importaciones dinámicas React
 *   - @/config/widgetUiMeta.ts      → metadatos UI (icon, color, flags)
 */

export type WidgetTier = "free" | "student" | "pro" | "ultra";

const TIER_ORDER: Record<WidgetTier, number> = {
  free: 0,
  student: 1,
  pro: 2,
  ultra: 3,
};

export const tierSatisfies = (userTier: string, required: string): boolean =>
  (TIER_ORDER[userTier as WidgetTier] ?? 0) >=
  (TIER_ORDER[required as WidgetTier] ?? 0);