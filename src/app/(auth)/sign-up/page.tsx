import { SignUpForm } from "./register-form";

export function generateMetadata() {
  return {
    title: `Alino | sign up`,
  };
}

export default async function SignUpPage() {
  return <SignUpForm />;
}
