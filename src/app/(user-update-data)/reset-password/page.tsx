import { readUserSession } from "@/lib/auth/actions";
import { ResetForm } from "./reset-form";
import { redirect } from "next/navigation";

export function generateMetadata() {
  return {
    title: `Alino | reset password`,
  };
}

export default async function Login() {
  const { data } = await readUserSession();
  if (!data.session) {
    return redirect("/sign-in");
  }
  return <ResetForm />;
}
