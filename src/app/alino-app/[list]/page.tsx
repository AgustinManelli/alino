"use client";
import { Todo } from "../components/todo/todo";

export default function ListTodoPage({ params }: { params: { list: string } }) {
  const { list } = params;
  return <Todo list={list} />;
}
