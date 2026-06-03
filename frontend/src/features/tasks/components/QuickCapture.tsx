import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";

type Props = {
  onSubmit: (text: string) => Promise<unknown>;
};

export function QuickCapture({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    await onSubmit(text);
    setText("");
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:flex-row">
      <input
        className="min-h-10 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-500"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Capture tarefas rapidamente"
      />
      <Button onClick={submit} disabled={loading}>
        <Send size={16} /> Capturar
      </Button>
    </div>
  );
}
