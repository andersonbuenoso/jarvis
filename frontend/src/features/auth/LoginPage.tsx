import { Eye, EyeOff, Lock, Moon, ShieldCheck, Sun, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "./useAuth";

export function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const { login, user } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password, remember);
    } catch {
      setError("Usuario ou senha invalidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Card className="w-full max-w-md border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jarvis</p>
              <h1 className="text-xl font-semibold text-slate-950 dark:text-white">Acesso administrativo</h1>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={toggleTheme} aria-label="Alternar tema" className="h-10 w-10 px-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Usuario</span>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
              <User size={17} className="text-slate-400" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Senha</span>
            <div className="mt-1 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950">
              <Lock size={17} className="text-slate-400" />
              <input className="min-w-0 flex-1 bg-transparent text-sm outline-none" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              <button type="button" className="text-slate-500 transition hover:text-slate-900 dark:hover:text-white" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Esconder senha" : "Ver senha"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              Lembrar acesso
            </label>
            <button type="button" className="font-medium text-slate-700 dark:text-slate-200" onClick={() => setError("A recuperacao de senha sera configurada no proximo passo.")}>
              Esqueci a senha
            </button>
          </div>

          {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div> : null}

          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
        </form>
      </Card>
    </main>
  );
}
