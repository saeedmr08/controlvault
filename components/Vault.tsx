"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { type Control, type ControlStatus } from "../lib/controls";

const STATUSES: Array<ControlStatus | "all"> = [
  "all",
  "open",
  "evidence_submitted",
  "accepted",
  "rejected",
];

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function Vault() {
  const [controls, setControls] = useState<Control[]>([]);
  const [gaps, setGaps] = useState(0);
  const [note, setNote] = useState("Loading controls from disk…");
  const [filter, setFilter] = useState<ControlStatus | "all">("all");
  const [newId, setNewId] = useState("LG-9");
  const [newTitle, setNewTitle] = useState("Logging retention");
  const [newOwner, setNewOwner] = useState("nia");
  const [busy, setBusy] = useState(false);

  const visible = useMemo(
    () => (filter === "all" ? controls : controls.filter((row) => row.status === filter)),
    [controls, filter],
  );

  async function refresh() {
    const response = await fetch("/api/controls");
    const body = (await response.json()) as { data: Control[]; gapCount: number };
    setControls(body.data);
    setGaps(body.gapCount);
    setNote(`${body.gapCount} open gap${body.gapCount === 1 ? "" : "s"} · data/controls.json`);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createControl(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch("/api/controls", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: newId, title: newTitle, owner: newOwner }),
    });
    const body = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setNote(body.error ?? "Create rejected");
      return;
    }
    await refresh();
    setNote(`${newId.toUpperCase()} added as open.`);
  }

  async function submitDigest(id: string) {
    const hash = await sha256Hex(`controlvault-demo-${id}`);
    const response = await fetch(`/api/controls/${id}/evidence`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hash }),
    });
    const body = (await response.json()) as { data?: Control; error?: string };
    if (!response.ok) {
      setNote(body.error ?? "Evidence rejected");
      return;
    }
    await refresh();
    setNote(`${id} is now ${body.data?.status}.`);
  }

  async function review(id: string, reviewer: string, accept: boolean) {
    const response = await fetch(`/api/controls/${id}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reviewer, accept }),
    });
    const body = (await response.json()) as { data?: Control; error?: string };
    if (!response.ok) {
      setNote(body.error ?? "Review rejected");
      return;
    }
    await refresh();
    setNote(`${id} is now ${body.data?.status}.`);
  }

  return (
    <main className="wrap">
      <p className="eyebrow">Assurance desk</p>
      <h1>ControlVault</h1>
      <p className="lede">
        {note} Gaps: <strong>{gaps}</strong>. Owners cannot accept their own evidence.
      </p>

      <form className="create" onSubmit={(event) => void createControl(event)}>
        <h2>Add a control</h2>
        <label>
          Id
          <input value={newId} onChange={(event) => setNewId(event.target.value)} />
        </label>
        <label>
          Title
          <input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
        </label>
        <label>
          Owner
          <input value={newOwner} onChange={(event) => setNewOwner(event.target.value)} />
        </label>
        <button type="submit" disabled={busy}>
          Create open control
        </button>
      </form>

      <div className="filters" role="group" aria-label="Filter by status">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={filter === status ? "active" : undefined}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty">
          No controls in this filter. Create one above, or switch the filter back to all.
        </p>
      ) : (
        visible.map((control) => (
          <article key={control.id} data-status={control.status}>
            <div>
              <strong>{control.id}</strong> {control.title}
              <span className="meta">
                owner {control.owner} · {control.status}
              </span>
              {control.evidenceHash ? (
                <code title={control.evidenceHash}>{control.evidenceHash.slice(0, 12)}…</code>
              ) : null}
            </div>
            <div className="actions">
              <button
                type="button"
                disabled={control.status !== "open" && control.status !== "rejected"}
                onClick={() => void submitDigest(control.id)}
              >
                Submit digest
              </button>
              <button
                type="button"
                disabled={control.status !== "evidence_submitted"}
                onClick={() => void review(control.id, "auditor", true)}
              >
                Auditor accept
              </button>
              <button
                type="button"
                disabled={control.status !== "evidence_submitted"}
                onClick={() => void review(control.id, "auditor", false)}
              >
                Reject
              </button>
              <button
                type="button"
                disabled={control.status !== "evidence_submitted"}
                onClick={() => void review(control.id, control.owner, true)}
              >
                Owner accept (must fail)
              </button>
            </div>
          </article>
        ))
      )}
    </main>
  );
}
