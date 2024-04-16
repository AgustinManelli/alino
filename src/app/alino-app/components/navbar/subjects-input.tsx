"use client";

import { AddSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import { useState } from "react";
import { useSubjects } from "@/store/todos";
import { SubjectSchema } from "@/lib/subject-schema";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export default function SubjectsInput() {
  const [input, setInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const setSubjects = useSubjects((state) => state.setSubjects);
  const subjects = useSubjects((state) => state.subjects);

  const handleSubmit = async () => {
    const subjectsAdd = await AddSubjectToDB(value);
    const { data: getSubjects } = (await GetSubjects()) as any;

    setSubjects(getSubjects);

    console.log(subjects);
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
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
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
