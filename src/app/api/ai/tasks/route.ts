import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  checkAIFeatureAccess,
  preCheckAICredits,
  handleAIError,
} from "@/lib/ai/aiMiddleware";
import { TaskPlanningInputSchema } from "@/lib/ai/schemas/taskPlanning";
import { TaskPlanningService } from "@/lib/ai/services/taskPlanningService";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const access = await checkAIFeatureAccess(supabase, user.id, "task_generation");
    if (!access.allowed) {
      return access.errorResponse;
    }

    const creditCheck = await preCheckAICredits(supabase, user.id);
    if (!creditCheck.allowed) {
      return creditCheck.errorResponse!;
    }

    const rawBody = await req.json().catch(() => null);
    const parsedInput = TaskPlanningInputSchema.safeParse(rawBody);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          error: parsedInput.error.errors[0]?.message || "Datos de entrada inválidos.",
          details: parsedInput.error.format(),
        },
        { status: 400 }
      );
    }

    const service = new TaskPlanningService();
    const result = await service.planAndExecute(parsedInput.data, user, supabase);

    return NextResponse.json({
      success: true,
      folders: result.folders,
      lists: result.lists,
      list: result.list,
      tasks: result.tasks,
      listSubject: result.list?.list?.list_name || "Plan Generado",
      credits: result.credits,
      tokenUsage: result.tokenUsage,
      metadata: result.metadata,
    });
  } catch (err: unknown) {
    console.error("[AI Tasks Route] Error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";

    if (message.includes("AI_LIMIT_EXCEEDED")) {
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