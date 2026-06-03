import { AlertTriangle, CheckCircle2, Flame, ListTodo, Timer, TriangleAlert } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../../components/ui/Card";
import { QuickCapture } from "../components/QuickCapture";
import { getDashboardSummary, quickCapture } from "../api/taskApi";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardSummary });
  const capture = useMutation({
    mutationFn: quickCapture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
  });

  if (isLoading) return <div className="text-sm text-slate-600">Carregando...</div>;
  if (error || !data) return <div className="text-sm text-red-600">Nao foi possivel carregar o dashboard.</div>;

  const cards = [
    { label: "Total", value: data.total, icon: ListTodo },
    { label: "Em aberto", value: data.open, icon: Timer },
    { label: "Concluidas", value: data.completed, icon: CheckCircle2 },
    { label: "Travadas", value: data.blocked, icon: TriangleAlert },
    { label: "Alta prioridade", value: data.high_priority, icon: Flame },
    { label: "Vencidas", value: data.overdue, icon: AlertTriangle },
    { label: "Para hoje", value: data.today, icon: Timer },
  ];

  return (
    <div className="space-y-5">
      <QuickCapture onSubmit={(text) => capture.mutateAsync(text)} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{item.label}</span>
              <item.icon size={18} className="text-slate-500" />
            </div>
            <strong className="mt-4 block text-3xl text-slate-950">{item.value}</strong>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="text-base font-semibold text-slate-950">Primeira acao recomendada agora</h2>
        {data.recommended_task ? (
          <div className="mt-3 rounded-md bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{data.recommended_task.title}</p>
            <p className="mt-1 text-sm text-slate-600">{data.recommended_task.next_action ?? "Definir a proxima acao para avancar."}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Nenhuma tarefa ativa no momento.</p>
        )}
      </Card>
    </div>
  );
}
