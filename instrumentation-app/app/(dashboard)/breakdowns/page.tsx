import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QuickStatusActions } from "./QuickStatusActions";
import { PlusCircle, Wrench } from "lucide-react";

export default async function BreakdownsPage() {
  const supabase = createClient();
  const { data: breakdowns } = await supabase
    .from("breakdowns")
    .select("id, fault_description, priority, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-brand-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Breakdowns</h1>
            <p className="text-sm text-gray-500">All reported instrumentation faults</p>
          </div>
        </div>
        <Link href="/breakdowns/new">
          <Button className="w-full gap-1.5 sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Report Breakdown
          </Button>
        </Link>
      </div>

      <Card className="overflow-x-auto p-0">
        {!breakdowns || breakdowns.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Wrench className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No breakdowns yet. Report the first one.</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="p-3">Description</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Work Status</th>
                <th className="p-3">Reported</th>
              </tr>
            </thead>
            <tbody>
              {breakdowns.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60">
                  <td className="p-3">
                    <Link href={`/breakdowns/${b.id}`} className="font-medium text-gray-900 hover:text-brand-600 hover:underline">
                      {b.fault_description}
                    </Link>
                  </td>
                  <td className="p-3">
                    <Badge tone={b.priority === "critical" ? "red" : b.priority === "high" ? "amber" : "gray"}>
                      {b.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <QuickStatusActions id={b.id} status={b.status} />
                  </td>
                  <td className="p-3 text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
