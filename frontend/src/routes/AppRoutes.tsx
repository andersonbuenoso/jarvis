import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { DailyPlanPage } from "../features/tasks/pages/DailyPlanPage";
import { DashboardPage } from "../features/tasks/pages/DashboardPage";
import { KanbanPage } from "../features/tasks/pages/KanbanPage";
import { SettingsPage } from "../features/tasks/pages/SettingsPage";
import { TasksPage } from "../features/tasks/pages/TasksPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
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
