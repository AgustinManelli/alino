import { SupabaseClient, User } from "@supabase/supabase-js";
import { getAIGateway } from "../gateway/aiGateway";
import {
  ENHANCE_SYSTEM_PROMPTS,
  TextEnhanceInput,
} from "../schemas/textEnhance";
import { AI_DEFAULT_CREDIT_COSTS } from "../creditCosts";
import { deductAICredits } from "../credits";

export class TextEnhanceService {
  async enhanceText(
    input: TextEnhanceInput,
    user: User,
    supabase: SupabaseClient
  ) {
    const gateway = getAIGateway();
    const systemPrompt = ENHANCE_SYSTEM_PROMPTS[input.action];

    const result = await gateway.generateText({
      systemPrompt,
      userPrompt: input.text,
      temperature: 0.3,
    });

    const deduction = await deductAICredits(
      supabase,
      result.usage,
      AI_DEFAULT_CREDIT_COSTS.enhance
    );

    if (!deduction.allowed) {
      throw new Error(
        deduction.reason === "feature_not_available"
          ? "FEATURE_NOT_AVAILABLE"
          : "AI_LIMIT_EXCEEDED"
      );
    }

    let saved = false;
    if (input.saveToDb && input.taskId) {
      const fieldToUpdate = input.field || "task_content";
      const formattedValue =
        fieldToUpdate === "task_content" && !result.data.startsWith("<")
          ? `<p>${result.data}</p>`
          : result.data;

      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          [fieldToUpdate]: formattedValue,
          updated_at: new Date().toISOString(),
        })
        .eq("task_id", input.taskId);

      if (!updateError) {
        saved = true;
      } else {
        console.warn(
          "[TextEnhanceService] Error al persistir texto mejorado en Supabase:",
          updateError.message
        );
      }
    }

    return {
      result: result.data,
      saved,
      credits: {
        used: deduction.creditCost,
        remaining: deduction.remainingCredits,
      },
      tokenUsage: result.usage,
      metadata: result.metadata,
    };
  }
}
