import { getSession } from "@/lib/auth/actions";
import { ResetForm } from "./reset-form";
import { redirect } from "next/navigation";

export function generateMetadata() {
  return {
    title: `Alino | reset password`,
  };
}

export default async function Login() {
  const result = await getSession();
  if (result.error) {
    return redirect("/sign-in");
  }
  return <ResetForm />;
}
