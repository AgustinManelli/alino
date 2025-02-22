import { ForgotPasswordForm } from "./forgot-password-form";

export function generateMetadata() {
  return {
    title: `Alino | forgot password`,
  };
}

export default async function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
