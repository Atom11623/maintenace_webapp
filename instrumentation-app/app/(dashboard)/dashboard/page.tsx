import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, Badge } from "@/components/ui/Card";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: breakdowns } = await supabase
    .from("breakdowns")
    .select("id, fault_description, priority, status, created_at, equipment_id")
    .order("created_at", { ascending: false })
    .limit(8);

  const active = (breakdowns ?? []).filter((b) => b.status !== "closed");
  const critical = active.filter((b) => b.priority === "critical");
  const completed = (breakdowns ?? []).filter((b) => b.status === "closed");

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-brand-700 to-brand-900 p-5 text-white shadow-sm">
        <h1 className="text-xl font-semibold">Department Dashboard</h1>
        <p className="mt-1 text-sm text-blue-100">Live overview of instrumentation department activity</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Breakdowns" value={active.length} icon={ClipboardList} />
        <StatCard
          label="Critical Faults"
          value={critical.length}
          icon={AlertTriangle}
          tone={critical.length > 0 ? "critical" : "default"}
        />
        <StatCard label="Completed (recent)" value={completed.length} icon={CheckCircle2} />
        <StatCard label="Total Logged" value={breakdowns?.length ?? 0} icon={ListChecks} />
      </div>

      <Card className="overflow-x-auto">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Breakdowns</h2>
          <Link href="/breakdowns" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>

        {!breakdowns || breakdowns.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No breakdowns logged yet.</p>
        ) : (
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400">
                <th className="pb-2">Description</th>
                <th className="pb-2">Priority</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {breakdowns.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60">
                  <td className="py-2">
                    <Link href={`/breakdowns/${b.id}`} className="font-medium text-gray-900 hover:text-brand-600 hover:underline">
                      {b.fault_description}
                    </Link>
                  </td>
                  <td className="py-2">
                    <Badge tone={b.priority === "critical" ? "red" : b.priority === "high" ? "amber" : "gray"}>
                      {b.priority}
                    </Badge>
                  </td>
                  <td className="py-2">
                    <Badge tone="blue">{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
