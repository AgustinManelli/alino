import { ResetForm } from "./reset-form";

export function generateMetadata() {
  return {
    title: `Alino | reset password`,
  };
}

export default async function ResetPassword() {
  return <ResetForm />;
}
