"use client";

import { AddSubjectToDB } from "@/lib/todo/actions";
import { useState } from "react";

export default function SubjectsInput() {
  const [input, setInput] = useState<boolean>(false);
  const handleSubmit = async () => {
    await AddSubjectToDB("test");
  };
  return (
    <>
      {input ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            placeholder="ingrese una materia"
            id="subjectsInput"
          ></input>
        </form>
      ) : (
        <button
          onClick={() => {
            setInput(!input);
          }}
        >
          +
        </button>
      )}
    </>
  );
}
