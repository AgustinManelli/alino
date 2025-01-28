import { getSession } from "@/lib/auth/actions";
import Todo from "../components/todo/todo";

export async function generateMetadata() {
  const result = await getSession();
  if (!result.error) {
    const nameSession =
      result.data?.session?.user.user_metadata.name ??
      result.data?.session?.user.email;
    return {
      title: `${nameSession}`,
    };
  }
}

export default function listTodoPage({ params }: { params: { list: string } }) {
  return (
    <>
      <Todo params={params} />
    </>
  );
}
