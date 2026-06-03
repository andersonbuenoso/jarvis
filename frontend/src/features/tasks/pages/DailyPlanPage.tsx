import { useQuery } from "@tanstack/react-query";
import { Card } from "../../../components/ui/Card";
import { getDailyPlan } from "../api/taskApi";
import type { Task } from "../types/task";

export function DailyPlanPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["daily-plan"], queryFn: getDailyPlan });

  if (isLoading) return <div className="text-sm text-slate-600">Carregando...</div>;
  if (error || !data) return <div className="text-sm text-red-600">Nao foi possivel carregar o plano do dia.</div>;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PlanBlock title="Urgente" tasks={data.urgent} />
      <PlanBlock title="Importante" tasks={data.important} />
      <PlanBlock title="Pode esperar" tasks={data.can_wait} />
      <PlanBlock title="Tarefas rapidas" tasks={data.quick_tasks} />
    </div>
  );
}

function PlanBlock({ title, tasks }: { title: string; tasks: Task[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-base font-semibold text-slate-950">{title}</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-md bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{task.title}</p>
            {task.next_action ? <p className="text-sm text-slate-600">{task.next_action}</p> : null}
          </div>
        ))}
        {tasks.length === 0 ? <p className="text-sm text-slate-500">Sem tarefas neste bloco.</p> : null}
      </div>
    </Card>
  );
}
