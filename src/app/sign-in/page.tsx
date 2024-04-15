"use server";

import { redirect } from "next/navigation";
import { readUserSession } from "../../lib/auth/actions";
import { FormContainer } from "../../components/forms/form-container";
import { LoginForm } from "./login-form";

export async function generateMetadata() {
  return {
    title: `alino | auth`,
  };
}

export default async function Login() {
  const { data } = await readUserSession();
  if (data.session) {
    return redirect("/alino-app");
  }

  return (
    <>
      <FormContainer>
        <LoginForm />
      </FormContainer>
    </>
  );
}
