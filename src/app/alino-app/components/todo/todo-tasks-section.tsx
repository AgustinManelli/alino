import { TasksSchema } from "@/lib/tasks-schema";
import { useSubjectSelected } from "@/store/subject-selected";
type SubjectsType = TasksSchema["public"]["Tables"]["todo"]["Row"];

export default function TodoTasksSection({
  tasks,
}: {
  tasks: Array<SubjectsType>;
}) {
  const subjectId = useSubjectSelected((state) => state.subjectId);
  return (
    <>
      {tasks
        .filter((task) => task.subject_id === subjectId)
        .map((task) => (
          <p>{task.task}</p>
        ))}
    </>
  );
}
