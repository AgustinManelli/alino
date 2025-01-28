import { LoginForm } from "./login-form";

export function generateMetadata() {
  return {
    title: `Alino | sign in`,
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
