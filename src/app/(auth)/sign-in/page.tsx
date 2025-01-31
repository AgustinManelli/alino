import { LoginForm } from "./login-form";

export function generateMetadata() {
  return {
    title: `Alino | sign in`,
  };
}

export default async function LoginPage() {
  return <LoginForm />;
}
