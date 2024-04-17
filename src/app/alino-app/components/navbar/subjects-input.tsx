"use client";

import { AddSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import { useEffect, useRef, useState } from "react";
import { useSubjects } from "@/store/todos";
import { SubjectSchema } from "@/lib/subject-schema";
import { LoadingIcon, PlusBoxIcon } from "@/lib/ui/icons";

type SubjectsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

export default function SubjectsInput({
  setWaiting,
}: {
  setWaiting: (value: boolean) => void;
}) {
  const [input, setInput] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const [color, setColor] = useState<string>("#87189d");
  const [transition, setTransition] = useState<boolean>(false);
  const setSubjects = useSubjects((state) => state.setSubjects);
  const subjects = useSubjects((state) => state.subjects);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setWaiting(true);
    setTransition(true);
    await AddSubjectToDB(value, color);
    const { data: getSubjects } = (await GetSubjects()) as any;
    setSubjects(getSubjects);
    setValue("");
    setTransition(false);
    setWaiting(false);
    setInput(false);
  };

  useEffect(() => {
    if (input) {
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    }
  }, [input]);

  useEffect(function mount() {
    function divOnClick(event: MouseEvent | TouchEvent) {
      if (divRef.current !== null) {
        if (!divRef.current.contains(event.target as Node)) {
          setInput(false);
        }
      }
    }
    window.addEventListener("mousedown", divOnClick);

    return function unMount() {
      window.removeEventListener("mousedown", divOnClick);
    };
  });

  return (
    <div ref={divRef}>
      {input ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          style={{ display: "flex" }}
        >
          <input
            type="text"
            placeholder="ingrese una materia"
            value={value}
            ref={inputRef}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            style={{
              width: "100%",
              height: "45px",
              borderRadius: "15px",
              border: "none",
              backgroundColor: "rgb(240,240,240)",
              cursor: "pointer",
              padding: "0px 0px 0px 10px",
              outline: "none",
            }}
          ></input>
          <input
            type="color"
            onChange={(e) => {
              setColor(e.target.value);
            }}
            value={color}
            style={{
              height: "30px",
              width: "30px",
              borderRadius: "15px",
              border: "none",
              cursor: "pointer",
              position: "absolute",
              right: "10px",
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
          style={{
            width: "100%",
            height: "45px",
            borderRadius: "15px",
            border: "none",
            backgroundColor: "rgb(250,250,250)",
            cursor: "pointer",
          }}
        >
          <PlusBoxIcon
            style={{
              stroke: "#1c1c1c",
              strokeWidth: "1.5",
              width: "25px",
            }}
          />
        </button>
      )}
    </div>
  );
}
