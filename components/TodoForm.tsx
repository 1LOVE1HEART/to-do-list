"use client";

import { useState } from "react";
import { useToast } from "./Toast";

interface Props {
  onCreated: (todo: any) => void;
}

export default function TodoForm({ onCreated }: Props) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), priority, dueDate: dueDate || null }),
    });
    if (res.ok) {
      const todo = await res.json();
      onCreated(todo);
      setTitle("");
      setDueDate("");
      setPriority("normal");
      setExpanded(false);
      toast("任務新增！");
    } else {
      const err = await res.json();
      toast(err.error ?? "新增失敗", "error");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="pixel-box-glow" style={{ padding: 16 }}>
      <div className="flex gap-2">
        <input
          className="pixel-input flex-1"
          placeholder="New Quest..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value && !expanded) setExpanded(true);
          }}
          onFocus={() => setExpanded(true)}
          maxLength={500}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="pixel-btn pixel-btn-green"
          style={{ whiteSpace: "nowrap" }}
        >
          + ADD
        </button>
      </div>

      {expanded && (
        <div className="flex gap-4 mt-3" style={{ flexWrap: "wrap" }}>
          <div>
            <label className="pixel-label">優先度</label>
            <select
              className="pixel-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">LOW</option>
              <option value="normal">NORMAL</option>
              <option value="high">HIGH</option>
            </select>
          </div>
          <div>
            <label className="pixel-label">到期日（可選）</label>
            <input
              type="date"
              className="pixel-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ minWidth: 160 }}
            />
          </div>
        </div>
      )}
    </form>
  );
}
