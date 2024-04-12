"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import { CreateUserInput, LoginUserInput } from "../../lib/user-schema";

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
  console.log(result);
  console.log(JSON.parse(JSON.stringify(result)));
  console.log(JSON.stringify(result));
  return JSON.stringify(result);
}

export async function signout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}

export async function updatePassword(formData: FormData) {
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
