import { SignInContent } from "./SignInContent";

export function generateMetadata() {
  return {
    title: `Iniciar sesion`,
  };
}

export default function LoginPage() {
  return <SignInContent />;
}
