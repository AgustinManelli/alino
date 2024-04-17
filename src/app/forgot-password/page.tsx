"use server";

import { redirect } from "next/navigation";
import { readUserSession } from "@/lib/auth/actions";
import { FormContainer } from "@/components/forms/form-container";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function SignOut() {
  const { data } = await readUserSession();
  if (data.session) {
    return redirect("/alino-app");
  }

  return (
    <FormContainer>
      <ForgotPasswordForm />
    </FormContainer>
  );
}