import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  checkAIFeatureAccess,
  preCheckAICredits,
} from "@/lib/ai/aiMiddleware";
import { getAIAgentOrchestrator } from "@/lib/ai/agent/orchestrator";
import {
  clearConversationHistory,
  deleteConversation,
  getOrCreateConversation,
  getPaginatedMessages,
  getUserConversations,
  loadRecentMessages,
  saveMessage,
  updateConversationTitle,
} from "@/lib/ai/agent/chatPersistence";

export const maxDuration = 45;

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const access = await checkAIFeatureAccess(supabase, user.id, "assistant_chat");
    if (!access.allowed) {
      return access.errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "conversations") {
      const page = parseInt(searchParams.get("page") || "0", 10);
      const limit = parseInt(searchParams.get("limit") || "15", 10);
      const result = await getUserConversations(supabase, user.id, page, limit);
      return NextResponse.json(result);
    }

    const requestedConvId = searchParams.get("conversationId");
    if (!requestedConvId) {
      return NextResponse.json({
        conversationId: null,
        messages: [],
        hasMore: false,
      });
    }

    const before = searchParams.get("before");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const result = await getPaginatedMessages(supabase, requestedConvId, before, limit);

    return NextResponse.json({
      conversationId: requestedConvId,
      messages: result.messages,
      hasMore: result.hasMore,
    });
  } catch (err: unknown) {
    console.error("[AI Chat GET] Error:", err);
    const msg = err instanceof Error ? err.message : "Error al cargar historial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const access = await checkAIFeatureAccess(supabase, user.id, "assistant_chat");
    if (!access.allowed) {
      return access.errorResponse;
    }

    const creditCheck = await preCheckAICredits(supabase, user.id);
    if (!creditCheck.allowed) {
      return creditCheck.errorResponse!;
    }

    const body = await req.json().catch(() => ({}));
    const {
      message,
      conversationId: requestedConvId,
      userTimezone,
      confirmedAction,
    } = body;

    if (!message && !confirmedAction) {
      return NextResponse.json(
        { error: "Debes enviar un mensaje o una acción para confirmar." },
        { status: 400 }
      );
    }

    const conversationId = await getOrCreateConversation(
      supabase,
      user.id,
      requestedConvId
    );

    const history = await loadRecentMessages(supabase, conversationId, 8);

    const [profileRes, subRes] = await Promise.all([
      supabase
        .from("users")
        .select("display_name, username, level, biography, timezone")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("tier, status, current_period_end")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing", "canceled"])
        .gt("current_period_end", new Date().toISOString())
        .order("current_period_end", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const userProfile = {
      display_name: profileRes.data?.display_name || user.email?.split("@")[0] || "Usuario",
      username: profileRes.data?.username || "usuario",
      level: profileRes.data?.level ?? 1,
      biography: profileRes.data?.biography,
      timezone: profileRes.data?.timezone || userTimezone || "UTC",
      tier: access.tier,
      subscription_status: subRes.data?.status ?? "active",
      period_end: subRes.data?.current_period_end ?? null,
    };

    const isFirstMessage = history.length === 0;

    if (message) {
      await saveMessage(supabase, conversationId, user.id, {
        role: "user",
        content: message,
      });

      history.push({ role: "user", content: message });
    }

    const orchestrator = getAIAgentOrchestrator();
    const result = await orchestrator.run({
      messages: history,
      context: {
        supabase,
        user,
        userId: user.id,
        userProfile,
      },
      userProfile,
      userTimezone: userProfile.timezone || userTimezone || "UTC",
      conversationId,
      confirmedAction,
    });

    let generatedTitle = result.conversationTitle || null;
    if (isFirstMessage) {
      if (generatedTitle) {
        await updateConversationTitle(supabase, conversationId, generatedTitle);
      } else {
        const fallback = message?.replace(/\n+/g, " ")?.trim()?.slice(0, 32);
        if (fallback) {
          await updateConversationTitle(supabase, conversationId, fallback);
          generatedTitle = fallback;
        }
      }
    }

    await saveMessage(supabase, conversationId, user.id, {
      role: "assistant",
      content: result.message,
      tool_calls: result.toolCallsExecuted.length > 0 ? result.toolCallsExecuted : null,
    });

    return NextResponse.json({
      message: result.message,
      conversationId: result.conversationId,
      title: generatedTitle,
      toolCallsExecuted: result.toolCallsExecuted,
      requiresConfirmation: result.requiresConfirmation,
      creditsUsed: result.creditsUsed,
      remainingCredits: result.remainingCredits,
    });
  } catch (err: unknown) {
    console.error("[AI Chat POST] Error:", err);
    const message = err instanceof Error ? err.message : "Error al procesar la solicitud con el asistente.";

    if (message.includes("Alcanzaste tu límite") || message.includes("AI_LIMIT_EXCEEDED")) {
      return NextResponse.json(
        {
          error: "Alcanzaste tu límite mensual de créditos de IA.",
          code: "AI_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if (auth.errorResponse) return auth.errorResponse;
    const { user, supabase } = auth;

    const access = await checkAIFeatureAccess(supabase, user.id, "assistant_chat");
    if (!access.allowed) {
      return access.errorResponse;
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const deleteEntireConv = searchParams.get("deleteConversation") === "true";

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId requerido" }, { status: 400 });
    }

    if (deleteEntireConv) {
      await deleteConversation(supabase, conversationId, user.id);
      return NextResponse.json({ success: true, message: "Conversación eliminada" });
    }

    await clearConversationHistory(supabase, conversationId, user.id);
    return NextResponse.json({ success: true, message: "Historial limpiado" });
  } catch (err: unknown) {
    console.error("[AI Chat DELETE] Error:", err);
    const msg = err instanceof Error ? err.message : "Error al limpiar historial";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
