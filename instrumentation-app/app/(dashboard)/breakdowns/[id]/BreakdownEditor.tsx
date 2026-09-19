"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Breakdown, BreakdownStatus } from "@/types/database";

const STATUS_FLOW: BreakdownStatus[] = [
  "reported",
  "assigned",
  "investigation",
  "repair",
  "testing",
  "restored",
  "closed",
];

export function BreakdownEditor({ breakdown }: { breakdown: Breakdown }) {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<BreakdownStatus>(breakdown.status);
  const [findings, setFindings] = useState(breakdown.findings ?? "");
  const [rootCause, setRootCause] = useState(breakdown.root_cause ?? "");
  const [correctiveAction, setCorrectiveAction] = useState(breakdown.corrective_action ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const isClosing = status === "closed" || status === "restored";

    await supabase
      .from("breakdowns")
      .update({
        status,
        findings,
        root_cause: rootCause,
        corrective_action: correctiveAction,
        ...(isClosing && !breakdown.end_time ? { end_time: new Date().toISOString() } : {}),
      })
      .eq("id", breakdown.id);

    setSaving(false);
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-sm font-semibold">Work Order Details</h2>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
        <select
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as BreakdownStatus)}
        >
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Findings</label>
        <textarea
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="What did you find on inspection? (technician-confirmed only)"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Root Cause</label>
        <textarea
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Corrective Action</label>
        <textarea
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={correctiveAction}
          onChange={(e) => setCorrectiveAction(e.target.value)}
        />
      </div>

      {breakdown.ai_suggestion && (
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs font-semibold uppercase text-blue-700">AI Suggestion (not confirmed)</p>
          <p className="mt-1 text-sm text-blue-900">{breakdown.ai_suggestion}</p>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </Card>
  );
}
