import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/Button";
import { createTask, deleteTask, getTasks, quickCapture, updateTask, updateTaskStatus } from "../api/taskApi";
import { QuickCapture } from "../components/QuickCapture";
import { TaskCard } from "../components/TaskCard";
import { TaskFilters, type Filters } from "../components/TaskFilters";
import { TaskForm } from "../components/TaskForm";
import type { Status, Task, TaskPayload } from "../types/task";

const initialFilters: Filters = { search: "", category: "TODAS", priority: "TODAS", status: "TODOS", project: "" };

export function TasksPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [editing, setEditing] = useState<Task | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: getTasks });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
  };

  const createMutation = useMutation({ mutationFn: createTask, onSuccess: refresh });
  const updateMutation = useMutation({ mutationFn: ({ id, payload }: { id: number; payload: TaskPayload }) => updateTask(id, payload), onSuccess: refresh });
  const statusMutation = useMutation({ mutationFn: ({ id, status }: { id: number; status: Status }) => updateTaskStatus(id, status), onSuccess: refresh });
  const deleteMutation = useMutation({ mutationFn: deleteTask, onSuccess: refresh });
  const captureMutation = useMutation({ mutationFn: quickCapture, onSuccess: refresh });

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => !filters.search || `${task.title} ${task.description ?? ""}`.toLowerCase().includes(filters.search.toLowerCase()))
      .filter((task) => filters.category === "TODAS" || task.category === filters.category)
      .filter((task) => filters.priority === "TODAS" || task.priority === filters.priority)
      .filter((task) => filters.status === "TODOS" || task.status === filters.status)
      .filter((task) => !filters.project || (task.project ?? "").toLowerCase().includes(filters.project.toLowerCase()))
      .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  }, [filters, tasks]);

  async function submitTask(payload: TaskPayload) {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, payload });
      setEditing(null);
    } else {
      await createMutation.mutateAsync(payload);
    }
  }

  return (
    <div className="space-y-5">
      <QuickCapture onSubmit={(text) => captureMutation.mutateAsync(text)} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-950">Tarefas</h2>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus size={16} /> Nova tarefa</Button>
      </div>
      <TaskFilters filters={filters} onChange={setFilters} />
      {isLoading ? <div className="text-sm text-slate-600">Carregando...</div> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatus={(id, status) => statusMutation.mutate({ id, status })} onEdit={(task) => { setEditing(task); setFormOpen(true); }} onDelete={(id) => deleteMutation.mutate(id)} />
        ))}
      </div>
      {!isLoading && filteredTasks.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">Nenhuma tarefa encontrada.</div> : null}
      {formOpen ? <TaskForm task={editing} onClose={() => setFormOpen(false)} onSubmit={submitTask} /> : null}
    </div>
  );
}

function priorityWeight(priority: string) {
  return { ALTA: 0, MEDIA: 1, BAIXA: 2 }[priority] ?? 3;
}
