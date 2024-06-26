import { readUserSession } from "@/lib/auth/actions";
import Navbar from "../components/navbar/navbar";
import Todo from "../components/todo/todo";
import { useLists } from "@/store/lists";
import { useRouter } from "next/navigation";

export async function generateMetadata() {
  const { data, error } = await readUserSession();
  if (!error) {
    const nameSession = data.session?.user.user_metadata.name ?? "user";
    return {
      title: `alino app | ${nameSession}`,
    };
  }
  return {
    title: "alino app",
  };
}

export default function listTodoPage({ params }: { params: { list: string } }) {
  return (
    <>
      <Todo params={params} />
    </>
  );
}
