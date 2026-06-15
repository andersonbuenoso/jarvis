import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "../ui/Button";
import { useAuth } from "../../features/auth/useAuth";
import { useTheme } from "../../features/theme/useTheme";

export function Header() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Jarvis</p>
        <h1 className="text-lg font-semibold text-slate-950 dark:text-white">Painel de produtividade</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-slate-500 dark:text-slate-300 sm:inline">{user?.role}</span>
        <Button type="button" variant="secondary" onClick={toggleTheme} aria-label="Alternar tema" className="h-10 w-10 px-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
        <Button type="button" variant="secondary" onClick={logout} aria-label="Sair" className="h-10 w-10 px-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
}
