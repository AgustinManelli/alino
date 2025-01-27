"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import {
  CreateUserInput,
  LoginUserInput,
  ResetUserInput,
  UpdatePasswordInput,
} from "@/lib/schemas/user-schema";

export async function signInWithEmailAndPassword(dataInput: LoginUserInput) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: dataInput.email,
    password: dataInput.password,
  });

  return JSON.stringify([error?.message, error]);
}

export async function signUpWithEmailAndPassword({
  dataInput,
  emailRedirectTo,
}: {
  dataInput: CreateUserInput;
  emailRedirectTo?: string;
}) {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email: dataInput.email,
    password: dataInput.password,
    options: {
      emailRedirectTo,
    },
  });

  return JSON.stringify([error?.message, error]);
}

export async function signout() {
  const supabase = createClient();

  await supabase.auth.signOut();

  redirect("/sign-in");
}

export async function resetPassword(data: ResetUserInput, href: string) {
  const supabase = createClient();

  const result = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${href}/auth/update-password`,
  });

  return JSON.stringify(result);
}

export async function updatePassword(data: UpdatePasswordInput) {
  const supabase = createClient();

  const result = await supabase.auth.updateUser({
    password: data.password,
  });

  return JSON.stringify(result);
}

export async function updatePasswordLogin(formData: FormData) {
  const supabase = createClient();
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

export async function readUserSession() {
  const supabase = createClient();
  const result = await supabase.auth.getSession();
  return result;
}

export async function readUserGetUser() {
  const supabase = createClient();
  const result = await supabase.auth.getUser();
  return result;
}
