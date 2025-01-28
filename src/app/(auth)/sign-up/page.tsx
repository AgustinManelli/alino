import { RegisterForm } from "./register-form";

export function generateMetadata() {
  return {
    title: `Alino | sign up`,
  };
}

export default function SignUpPage() {
  return <RegisterForm />;
}
