import { CalendarCheck, Kanban, LayoutDashboard, ListTodo, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tarefas", icon: ListTodo },
  { to: "/daily-plan", label: "Plano do Dia", icon: CalendarCheck },
  { to: "/kanban", label: "Kanban", icon: Kanban },
  { to: "/settings", label: "Configuracoes", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
      <div className="mb-8">
        <span className="text-xl font-bold text-slate-950 dark:text-white">Jarvis</span>
        <p className="text-sm text-slate-500 dark:text-slate-400">Assistente de tarefas</p>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 dark:text-slate-300", isActive && "bg-slate-950 text-white dark:bg-white dark:text-slate-950")}>
            <item.icon size={18} /> {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
