import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Informe o titulo"),
  description: z.string().optional().nullable(),
  project: z.string().optional().nullable(),
  category: z.enum(["TRABALHO", "AULAS", "PROJETOS", "ESTUDOS", "PESSOAL", "COMUNICACAO"]),
  priority: z.enum(["ALTA", "MEDIA", "BAIXA"]),
  status: z.enum(["A_FAZER", "FAZENDO", "TRAVADO", "CONCLUIDO", "CANCELADO"]),
  due_date: z.string().optional().nullable(),
  next_action: z.string().optional().nullable(),
  estimated_minutes: z.coerce.number().min(0).optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
