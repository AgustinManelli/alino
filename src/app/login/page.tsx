"use server";

import { redirect } from "next/navigation";
import { readUserSession } from "./actions";
import AuthForms from "./auth-forms";

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
      <AuthForms />
    </>
  );
}
