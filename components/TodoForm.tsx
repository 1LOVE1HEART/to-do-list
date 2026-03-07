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
      toast("Task added!");
    } else {
      const err = await res.json();
      toast(err.error ?? "Failed to add", "error");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        <textarea
          className="input"
          placeholder="Add a new task…"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value && !expanded) setExpanded(true);
          }}
          onFocus={() => setExpanded(true)}
          maxLength={500}
          autoComplete="off"
          rows={expanded ? 2 : 1}
          style={{ resize: "none", flexShrink: 1, flex: 1 }}
        />
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="btn btn-primary"
          style={{ alignSelf: "flex-end", flexShrink: 0 }}
        >
          {loading ? "…" : "+ Add"}
        </button>
      </div>

      {expanded && (
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          <div>
            <label className="label">Priority</label>
            <select
              className="select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Due date (optional)</label>
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
      )}
    </form>
  );
}
