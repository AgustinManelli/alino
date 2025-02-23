import { getSession } from "@/lib/auth/actions";
import Manager from "./components/todo/manager";

export async function generateMetadata() {
  return {
    title: "Home",
  };
}

const style = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
} as React.CSSProperties;

export default async function AlinoApp() {
  const { data } = await getSession();

  return (
    <div style={style}>
      <Manager h={true} userName={data?.session?.user.user_metadata?.name} />
    </div>
  );
}
