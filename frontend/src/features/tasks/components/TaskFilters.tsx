import { Search } from "lucide-react";
import { formatEnum } from "../../../lib/utils";
import { categories, priorities, statuses, type Category, type Priority, type Status } from "../types/task";

export type Filters = {
  search: string;
  category: Category | "TODAS";
  priority: Priority | "TODAS";
  status: Status | "TODOS";
  project: string;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function TaskFilters({ filters, onChange }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,1fr)]">
      <label className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        <input className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-500" value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Buscar" />
      </label>
      <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.category} onChange={(event) => onChange({ ...filters, category: event.target.value as Filters["category"] })}>
        <option value="TODAS">Categorias</option>
        {categories.map((item) => <option key={item} value={item}>{formatEnum(item)}</option>)}
      </select>
      <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value as Filters["priority"] })}>
        <option value="TODAS">Prioridades</option>
        {priorities.map((item) => <option key={item} value={item}>{formatEnum(item)}</option>)}
      </select>
      <select className="h-10 rounded-md border border-slate-200 px-3 text-sm" value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value as Filters["status"] })}>
        <option value="TODOS">Status</option>
        {statuses.map((item) => <option key={item} value={item}>{formatEnum(item)}</option>)}
      </select>
      <input className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-500" value={filters.project} onChange={(event) => onChange({ ...filters, project: event.target.value })} placeholder="Projeto" />
    </div>
  );
}
