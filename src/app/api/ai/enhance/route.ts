import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  checkAIFeatureAccess,
  preCheckAICredits,
  handleAIError,
} from "@/lib/ai/aiMiddleware";
import { TextEnhanceInputSchema } from "@/lib/ai/schemas/textEnhance";
import { TextEnhanceService } from "@/lib/ai/services/textEnhanceService";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const access = await checkAIFeatureAccess(supabase, user.id, "text_enhance");
    if (!access.allowed) {
      return access.errorResponse;
    }

    const creditCheck = await preCheckAICredits(supabase, user.id);
    if (!creditCheck.allowed) {
      return creditCheck.errorResponse!;
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = TextEnhanceInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors[0]?.message || "Entrada inválida.",
        },
        { status: 400 }
      );
    }

    const service = new TextEnhanceService();
    const result = await service.enhanceText(parsed.data, user, supabase);

    return NextResponse.json({
      result: result.result,
      saved: result.saved,
      credits: result.credits,
      tokenUsage: result.tokenUsage,
      metadata: result.metadata,
    });
  } catch (err: unknown) {
    console.error("[AI Enhance Route] Error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";

    if (
      message.includes("Alcanzaste tu límite") ||
      message.includes("AI_LIMIT_EXCEEDED")
    ) {
      return NextResponse.json(
        {
          error:
            "Alcanzaste tu límite de créditos IA para este período. Podés ver tu uso en Mi cuenta.",
          code: "AI_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    if (message.includes("FEATURE_NOT_AVAILABLE")) {
      return NextResponse.json(
        {
          error: "Esta función de IA no está disponible en tu plan actual.",
          code: "FEATURE_NOT_AVAILABLE",
        },
        { status: 403 }
      );
    }

    return handleAIError(err);
  }
}