"use server";

import { createClient } from "@/utils/supabase/server";

export interface BillingTransaction {
  id: string;
  user_id: string;
  transaction_type: "subscription" | "coin_pack" | string;
  title: string;
  tier?: "free" | "pro" | "ultra" | string | null;
  amount: number;
  currency: string;
  status: "approved" | "rejected" | "pending" | "refunded" | "failed" | string;
  is_recurring: boolean;
  gateway: string;
  gateway_payment_id?: string | null;
  payment_method?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CoinMovement {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  transaction_type: string;
  description: string;
  reference_id?: string | null;
  reference_type?: string | null;
  metadata?: Record<string, unknown> | null;
  idempotency_key?: string | null;
  created_at: string;
}

export interface TransactionsSummary {
  current_coins: number;
  total_coins_spent: number;
  total_coins_earned: number;
}

export interface TransactionsHistoryResult {
  billing: BillingTransaction[];
  coin_movements: CoinMovement[];
  summary: TransactionsSummary;
}

export async function getUserTransactionsHistoryAction(
  filter: "all" | "subscriptions" | "coin_packs" | "coin_movements" = "all",
  limit: number = 60,
  offset: number = 0,
): Promise<{
  data?: TransactionsHistoryResult;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "No autenticado." };
    }

    const { data, error } = await supabase.rpc(
      "get_user_transactions_history",
      {
        p_filter: filter,
        p_limit: limit,
        p_offset: offset,
      },
    );

    if (error) throw new Error(error.message);

    return {
      data: data as TransactionsHistoryResult,
    };
  } catch (err: unknown) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Error al obtener el historial de transacciones.",
    };
  }
}
