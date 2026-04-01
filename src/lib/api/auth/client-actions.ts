import { createClient } from "@/utils/supabase/client";

export const loginWithOAuth = async (
  providerType: "google" | "github",
  originUrl: string
) => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: providerType,
      options: {
        redirectTo: `${originUrl}/auth/callback`,
      },
    });

    if (error) {
      throw new Error("Error al iniciar sesión. Inténtalo nuevamente o contacta con soporte.");
    }

    return { error: null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred." };
  }
};