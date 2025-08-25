import { Todo } from "../components/todo/todo";

export default function ListTodoPage({ params }: { params: { list: string } }) {
  return <Todo params={params} />;
}
