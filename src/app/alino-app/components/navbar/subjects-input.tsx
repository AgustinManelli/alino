"use client";

import { AddSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import { useState } from "react";
import { useSubjects } from "@/store/todos";
import { SubjectSchema } from "@/lib/subject-schema";
import { LoadingIcon } from "@/lib/ui/icons";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export default function SubjectsInput() {
  const [input, setInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [transition, setTransition] = useState<boolean>(false);
  const setSubjects = useSubjects((state) => state.setSubjects);
  const subjects = useSubjects((state) => state.subjects);

  const handleSubmit = async () => {
    setTransition(true);
    await AddSubjectToDB(value);
    const { data: getSubjects } = (await GetSubjects()) as any;
    setSubjects(getSubjects);
    setValue("");
    setTransition(false);
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
          {transition ? (
            <LoadingIcon
              style={{
                width: "20px",
                height: "auto",
                stroke: "#000",
                strokeWidth: "3",
              }}
            />
          ) : (
            ""
          )}
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
