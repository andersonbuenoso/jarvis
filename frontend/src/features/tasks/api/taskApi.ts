import { api } from "../../../services/api";
import type { DailyPlan, DashboardSummary, Status, Task, TaskPayload } from "../types/task";

export async function getTasks() {
  const { data } = await api.get<Task[]>("/api/tasks");
  return data;
}

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/api/dashboard/summary");
  return data;
}

export async function getDailyPlan() {
  const { data } = await api.get<DailyPlan>("/api/daily-plan");
  return data;
}

export async function createTask(payload: TaskPayload) {
  const { data } = await api.post<Task>("/api/tasks", payload);
  return data;
}

export async function updateTask(id: number, payload: Partial<TaskPayload>) {
  const { data } = await api.put<Task>(`/api/tasks/${id}`, payload);
  return data;
}

export async function updateTaskStatus(id: number, status: Status) {
  const { data } = await api.patch<Task>(`/api/tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id: number) {
  await api.delete(`/api/tasks/${id}`);
}

export async function quickCapture(text: string) {
  const { data } = await api.post<Task[]>("/api/tasks/quick-capture", { text });
  return data;
}
