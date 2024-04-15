"use server";

import { redirect } from "next/navigation";
import { readUserSession } from "@/lib/auth/actions";
import { RegisterForm } from "./register-form";
import { FormContainer } from "@/components/forms/form-container";

export default async function SignOut() {
  const { data } = await readUserSession();
  if (data.session) {
    return redirect("/alino-app");
  }

  return (
    <FormContainer>
      <RegisterForm />
    </FormContainer>
  );
}
