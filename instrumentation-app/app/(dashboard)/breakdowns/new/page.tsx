"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Equipment } from "@/types/database";
import { PLANT_LOCATIONS } from "@/lib/constants";

export default function NewBreakdownPage() {
  const router = useRouter();
  const supabase = createClient();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [form, setForm] = useState({
    equipment_id: "",
    location: PLANT_LOCATIONS[0] as string,
    fault_description: "",
    alarm_code: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("breakdowns")
      .insert({
        equipment_id: form.equipment_id || null,
        location: form.location,
        fault_description: form.fault_description,
        alarm_code: form.alarm_code || null,
        priority: form.priority,
        reported_by: user.id,
        status: "reported",
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/breakdowns/${data.id}`);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Report Breakdown</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Equipment</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.equipment_id}
              onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}
            >
              <option value="">-- Select equipment (optional) --</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.tag_number} — {eq.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
            <select
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            >
              {PLANT_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Fault Description *</label>
            <textarea
              required
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={form.fault_description}
              onChange={(e) => setForm({ ...form, fault_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Alarm / Error Code</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.alarm_code}
                onChange={(e) => setForm({ ...form, alarm_code: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
