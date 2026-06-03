import { CheckCircle2, Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { cn, formatEnum } from "../../../lib/utils";
import type { Status, Task } from "../types/task";

type Props = {
  task: Task;
  onStatus: (id: number, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function TaskCard({ task, onStatus, onEdit, onDelete }: Props) {
  const priorityColor = {
    ALTA: "bg-red-50 text-red-700 border-red-200",
    MEDIA: "bg-amber-50 text-amber-700 border-amber-200",
    BAIXA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  }[task.priority];

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{task.title}</h3>
            {task.next_action ? <p className="mt-1 text-sm text-slate-600">{task.next_action}</p> : null}
          </div>
          <span className={cn("shrink-0 rounded-md border px-2 py-1 text-xs font-semibold", priorityColor)}>{formatEnum(task.priority)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-md bg-slate-100 px-2 py-1">{formatEnum(task.category)}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1">{formatEnum(task.status)}</span>
          {task.project ? <span className="rounded-md bg-slate-100 px-2 py-1">{task.project}</span> : null}
          {task.estimated_minutes ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <Clock size={12} /> {task.estimated_minutes} min
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onStatus(task.id, "FAZENDO")}>Fazendo</Button>
          <Button variant="secondary" onClick={() => onStatus(task.id, "CONCLUIDO")}><CheckCircle2 size={16} /> Concluir</Button>
          <Button variant="secondary" onClick={() => onStatus(task.id, "CANCELADO")}>Cancelar</Button>
          <Button variant="ghost" onClick={() => onEdit(task)} aria-label="Editar"><Edit size={16} /></Button>
          <Button variant="ghost" onClick={() => onDelete(task.id)} aria-label="Excluir"><Trash2 size={16} /></Button>
        </div>
      </div>
    </Card>
  );
}
