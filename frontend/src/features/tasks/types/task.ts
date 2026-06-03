export type Category = "TRABALHO" | "AULAS" | "PROJETOS" | "ESTUDOS" | "PESSOAL" | "COMUNICACAO";
export type Priority = "ALTA" | "MEDIA" | "BAIXA";
export type Status = "A_FAZER" | "FAZENDO" | "TRAVADO" | "CONCLUIDO" | "CANCELADO";

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  project?: string | null;
  category: Category;
  priority: Priority;
  status: Status;
  due_date?: string | null;
  next_action?: string | null;
  estimated_minutes?: number | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
};

export type TaskPayload = Omit<Task, "id" | "created_at" | "updated_at" | "completed_at">;

export type DashboardSummary = {
  total: number;
  open: number;
  completed: number;
  blocked: number;
  high_priority: number;
  overdue: number;
  today: number;
  recommended_task?: Task | null;
};

export type DailyPlan = {
  urgent: Task[];
  important: Task[];
  can_wait: Task[];
  quick_tasks: Task[];
};

export const categories: Category[] = ["TRABALHO", "AULAS", "PROJETOS", "ESTUDOS", "PESSOAL", "COMUNICACAO"];
export const priorities: Priority[] = ["ALTA", "MEDIA", "BAIXA"];
export const statuses: Status[] = ["A_FAZER", "FAZENDO", "TRAVADO", "CONCLUIDO", "CANCELADO"];
