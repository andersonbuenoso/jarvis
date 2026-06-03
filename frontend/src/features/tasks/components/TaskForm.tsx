import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import { formatEnum } from "../../../lib/utils";
import { taskSchema, type TaskFormValues } from "../schemas/taskSchema";
import { categories, priorities, statuses, type Task, type TaskPayload } from "../types/task";

type Props = {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => Promise<unknown>;
};

const emptyValues: TaskFormValues = {
  title: "",
  description: "",
  project: "",
  category: "PESSOAL",
  priority: "MEDIA",
  status: "A_FAZER",
  due_date: "",
  next_action: "",
  estimated_minutes: null,
};

export function TaskForm({ task, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    reset(task ? {
      title: task.title,
      description: task.description ?? "",
      project: task.project ?? "",
      category: task.category,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? "",
      next_action: task.next_action ?? "",
      estimated_minutes: task.estimated_minutes ?? null,
    } : emptyValues);
  }, [reset, task]);

  async function submit(values: TaskFormValues) {
    await onSubmit({
      ...values,
      description: values.description || null,
      project: values.project || null,
      due_date: values.due_date || null,
      next_action: values.next_action || null,
      estimated_minutes: values.estimated_minutes ?? null,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/30 p-0 sm:items-center sm:justify-center sm:p-4">
      <form onSubmit={handleSubmit(submit)} className="max-h-[92vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-panel sm:max-w-2xl sm:rounded-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">{task ? "Editar tarefa" : "Nova tarefa"}</h2>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Fechar"><X size={18} /></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Titulo</span>
            <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register("title")} />
            {errors.title ? <span className="text-xs text-red-600">{errors.title.message}</span> : null}
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Descricao</span>
            <textarea className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" {...register("description")} />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-600">Projeto</span>
            <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register("project")} />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-600">Prazo</span>
            <input type="date" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register("due_date")} />
          </label>
          <Select label="Categoria" register={register("category")} options={categories} />
          <Select label="Prioridade" register={register("priority")} options={priorities} />
          <Select label="Status" register={register("status")} options={statuses} />
          <label>
            <span className="text-xs font-medium text-slate-600">Tempo estimado</span>
            <input type="number" min={0} className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register("estimated_minutes")} />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-medium text-slate-600">Proxima acao</span>
            <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register("next_action")} />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>Salvar</Button>
        </div>
      </form>
    </div>
  );
}

function Select({ label, register, options }: { label: string; register: UseFormRegisterReturn; options: string[] }) {
  return (
    <label>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <select className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm" {...register}>
        {options.map((option) => <option key={option} value={option}>{formatEnum(option)}</option>)}
      </select>
    </label>
  );
}
