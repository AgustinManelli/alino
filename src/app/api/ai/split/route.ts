import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  checkAIFeatureAccess,
  preCheckAICredits,
  handleAIError,
} from "@/lib/ai/aiMiddleware";
import { TaskSplitInputSchema } from "@/lib/ai/schemas/taskSplit";
import { TaskSplitService } from "@/lib/ai/services/taskSplitService";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const access = await checkAIFeatureAccess(supabase, user.id, "task_split");
    if (!access.allowed) {
      return access.errorResponse;
    }

    const creditCheck = await preCheckAICredits(supabase, user.id);
    if (!creditCheck.allowed) {
      return creditCheck.errorResponse!;
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = TaskSplitInputSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Entrada inválida." },
        { status: 400 }
      );
    }

    const service = new TaskSplitService();
    const result = await service.execute(parsed.data, user, supabase);

    return NextResponse.json({
      tasks: result.tasks,
      persistedTasks: result.persistedTasks,
      credits: result.credits,
      tokenUsage: result.tokenUsage,
      metadata: result.metadata,
    });
  } catch (err: unknown) {
    console.error("[AI Split Route] Error:", err);
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

    return handleAIError(err);
  }
}
