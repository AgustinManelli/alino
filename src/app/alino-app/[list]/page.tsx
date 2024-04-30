import Todo from "../components/todo/todo";

export default function listTodoPage({ params }: { params: { list: string } }) {
  return <Todo params={params} />;
}
