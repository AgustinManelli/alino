/**
 * WidgetPreviewContext
 *
 * Contexto que indica si un widget está siendo renderizado
 * en modo preview (galería, no funcional).
 *
 * Los widgets pueden consumir este contexto para:
 * - Evitar fetches de datos innecesarios
 * - Evitar timers / side-effects
 * - Mostrar estado de "placeholder" en lugar de datos reales
 *
 * Uso dentro de un widget:
 *   const isPreview = useWidgetPreview();
 *   if (isPreview) return <MyPreviewFallback />;
 */
"use client";

import { createContext, useContext } from "react";

const WidgetPreviewContext = createContext<boolean>(false);

export const WidgetPreviewProvider = WidgetPreviewContext.Provider;

/** Devuelve `true` si el widget está dentro de una preview de la galería */
export const useWidgetPreview = () => useContext(WidgetPreviewContext);
