"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import {
  CreateUserInput,
  LoginUserInput,
  ResetUserInput,
  UpdatePasswordInput,
} from "../../lib/user-schema";

export async function signInWithEmailAndPassword(data: LoginUserInput) {
  const supabase = await createClient();
  const result = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  return JSON.stringify(result);
}

export async function signUpWithEmailAndPassword({
  data,
  emailRedirectTo,
}: {
  data: CreateUserInput;
  emailRedirectTo?: string;
}) {
  const supabase = await createClient();
  const result = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo,
    },
  });
  return JSON.stringify(result);
}

export async function signout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function resetPassword(data: ResetUserInput, href: string) {
  const supabase = await createClient();
  const result = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${href}/auth/callback`,
  });
  return JSON.stringify(result);
}

export async function updatePassword(data: UpdatePasswordInput) {
  const supabase = await createClient();
  const result = await supabase.auth.updateUser({
    password: data.password,
  });
  return JSON.stringify(result);
}

export async function updatePasswordLogin(formData: FormData) {
  const supabase = await createClient();
  const data = {
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.updateUser(data);
  if (error) {
    redirect("/error");
  }
  revalidatePath("/", "layout");
  redirect("/alino-app");
}
