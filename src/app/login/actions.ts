"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("login");
  }

  revalidatePath("/", "layout");
  redirect("/alino-app");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/alino-app");
}

export async function signout() {
  const supabase = createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function updatePassword(formData: FormData) {
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
