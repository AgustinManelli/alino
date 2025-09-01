import { Todo } from "../components/todo/todo";

export default async function ListTodoPage({
  params,
}: {
  params: Promise<{ list: string }>;
}) {
  const { list } = await params;
  return <Todo list={list} />;
}
