import { AuthForm } from "../../components/auth-form";

export function generateMetadata() {
  return {
    title: `sign in`,
  };
}

export default function LoginPage() {
  return (
    <AuthForm
      title="Iniciar sesión en Alino"
      description="Tu organización en un solo lugar. Fácil, rápido y sin complicaciones."
      showOAuth={true}
    />
  );
}
