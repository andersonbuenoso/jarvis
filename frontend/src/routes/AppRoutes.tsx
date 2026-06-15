import { type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { useAuth } from "../features/auth/useAuth";
import { DailyPlanPage } from "../features/tasks/pages/DailyPlanPage";
import { DashboardPage } from "../features/tasks/pages/DashboardPage";
import { KanbanPage } from "../features/tasks/pages/KanbanPage";
import { SettingsPage } from "../features/tasks/pages/SettingsPage";
import { TasksPage } from "../features/tasks/pages/TasksPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "daily-plan", element: <DailyPlanPage /> },
      { path: "kanban", element: <KanbanPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
