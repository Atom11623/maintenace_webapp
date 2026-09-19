import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, ListChecks, ImageOff } from "lucide-react";
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

  // Fetch one photo per breakdown (the most recent) to show as a thumbnail.
  const breakdownIds = (breakdowns ?? []).map((b) => b.id);
  const photoByBreakdown = new Map<string, string>();

  if (breakdownIds.length > 0) {
    const { data: photos } = await supabase
      .from("breakdown_photos")
      .select("breakdown_id, storage_path, created_at")
      .in("breakdown_id", breakdownIds)
      .order("created_at", { ascending: false });

    for (const p of photos ?? []) {
      if (!photoByBreakdown.has(p.breakdown_id)) {
        const url = supabase.storage.from("breakdown-photos").getPublicUrl(p.storage_path).data.publicUrl;
        photoByBreakdown.set(p.breakdown_id, url);
      }
    }
  }

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

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Breakdowns</h2>
          <Link href="/breakdowns" className="text-sm text-brand-600 hover:underline">
            View all
          </Link>
        </div>

        {!breakdowns || breakdowns.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No breakdowns logged yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {breakdowns.map((b) => {
              const photoUrl = photoByBreakdown.get(b.id);
              return (
                <Link
                  key={b.id}
                  href={`/breakdowns/${b.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-gray-50/60"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{b.fault_description}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge tone={b.priority === "critical" ? "red" : b.priority === "high" ? "amber" : "gray"}>
                        {b.priority}
                      </Badge>
                      <Badge tone="blue">{b.status}</Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
