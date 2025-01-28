"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  CreateUserInput,
  LoginUserInput,
  ResetUserInput,
  UpdatePasswordInput,
} from "@/lib/schemas/user-schema";

export async function signInWithEmailAndPassword(dataInput: LoginUserInput) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: dataInput.email,
    password: dataInput.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function signUpWithEmailAndPassword({
  dataInput,
  emailRedirectTo,
}: {
  dataInput: CreateUserInput;
  emailRedirectTo?: string;
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email: dataInput.email,
    password: dataInput.password,
    options: {
      emailRedirectTo,
    },
  });

  //verificacion de si el usuario ya existe.

  if (error) {
    return { error: error.message };
  } else if (data.user?.identities?.length === 0) {
    return {
      error:
        "El email que estás intentando registrar ya existe. Verifica el email e intentalo nuevamente.",
    };
  } else {
    return { data };
  }
}

export async function signout() {
  const supabase = createClient();

  await supabase.auth.signOut();

  redirect("/sign-in");
}

export async function signOutLocal() {
  const supabase = createClient();

  await supabase.auth.signOut({ scope: "local" });

  redirect("/sign-in");
}

export async function resetPassword(
  dataInput: ResetUserInput,
  emailRedirectTo: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    dataInput.email,
    {
      redirectTo: `${emailRedirectTo}/auth/update-password`,
    }
  );

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function updatePassword(dataInput: UpdatePasswordInput) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: dataInput.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { error: error.message };
  }

  return { data };
}
