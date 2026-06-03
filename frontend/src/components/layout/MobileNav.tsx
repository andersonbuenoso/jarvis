import { CalendarCheck, Kanban, LayoutDashboard, ListTodo } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const nav = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/tasks", label: "Tarefas", icon: ListTodo },
  { to: "/daily-plan", label: "Dia", icon: CalendarCheck },
  { to: "/kanban", label: "Kanban", icon: Kanban },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white lg:hidden">
      {nav.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500", isActive && "text-slate-950")}>
          <item.icon size={19} /> {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
