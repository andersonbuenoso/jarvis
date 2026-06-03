import { formatEnum } from "../../../lib/utils";
import { TaskCard } from "./TaskCard";
import { statuses, type Status, type Task } from "../types/task";

type Props = {
  tasks: Task[];
  onStatus: (id: number, status: Status) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function TaskKanban({ tasks, onStatus, onEdit, onDelete }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {statuses.map((status) => (
        <section key={status} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">{formatEnum(status)}</h2>
            <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-600">{tasks.filter((task) => task.status === status).length}</span>
          </div>
          <div className="space-y-3">
            {tasks.filter((task) => task.status === status).map((task) => (
              <TaskCard key={task.id} task={task} onStatus={onStatus} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
