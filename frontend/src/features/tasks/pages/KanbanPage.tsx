import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTask, getTasks, updateTask, updateTaskStatus } from "../api/taskApi";
import { TaskForm } from "../components/TaskForm";
import { TaskKanban } from "../components/TaskKanban";
import type { Status, Task, TaskPayload } from "../types/task";

export function KanbanPage() {
  const [editing, setEditing] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });
  const statusMutation = useMutation({ mutationFn: ({ id, status }: { id: number; status: Status }) => updateTaskStatus(id, status), onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: TaskPayload }) => updateTask(id, payload), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: deleteTask, onSuccess: refresh });

  if (isLoading) return <div className="text-sm text-slate-600">Carregando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-950">Kanban</h2>
      <TaskKanban tasks={tasks} onStatus={(id, status) => statusMutation.mutate({ id, status })} onEdit={setEditing} onDelete={(id) => deleteMutation.mutate(id)} />
      {editing ? <TaskForm task={editing} onClose={() => setEditing(null)} onSubmit={(payload) => updateMutation.mutateAsync({ id: editing.id, payload })} /> : null}
    </div>
  );
}
