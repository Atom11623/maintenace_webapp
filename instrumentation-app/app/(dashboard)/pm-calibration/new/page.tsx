"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Equipment } from "@/types/database";

export default function NewPMSchedulePage() {
  const router = useRouter();
  const supabase = createClient();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [form, setForm] = useState({
    equipment_id: "",
    task_name: "",
    frequency_days: "30",
    next_due: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("equipment")
      .select("*")
      .order("tag_number")
      .then(({ data }) => setEquipmentList((data as Equipment[]) ?? []));
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.equipment_id) {
      setError("Select equipment.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("pm_schedules").insert({
      equipment_id: form.equipment_id,
      task_name: form.task_name,
      frequency_days: Number(form.frequency_days),
      next_due: form.next_due,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/pm-calibration");
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Add PM Schedule</h1>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Equipment *</label>
            <select
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.equipment_id}
              onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
            >
              <option value="">-- Select equipment --</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.tag_number} — {eq.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Task *</label>
            <input
              required
              placeholder="e.g. Calibrate pressure transmitter"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.task_name}
              onChange={(e) => setForm({ ...form, task_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Frequency (days)</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.frequency_days}
                onChange={(e) => setForm({ ...form, frequency_days: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Next Due</label>
              <input
                type="date"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.next_due}
                onChange={(e) => setForm({ ...form, next_due: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Schedule"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
