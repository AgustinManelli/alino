import { LoginForm } from "./login-form";

export function generateMetadata() {
  return {
    title: `alino | sign in`,
  };
}

export default function Login() {
  return <LoginForm />;
}
