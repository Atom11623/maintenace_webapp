import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui/Card";
import { BreakdownEditor } from "./BreakdownEditor";
import { QuickStatusActions } from "../QuickStatusActions";
import { CommentThread, type CommentWithAuthor } from "@/components/shared/CommentThread";

export default async function BreakdownDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: breakdown } = await supabase
    .from("breakdowns")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!breakdown) notFound();

  const { data: equipment } = breakdown.equipment_id
    ? await supabase.from("equipment").select("tag_number, name").eq("id", breakdown.equipment_id).single()
    : { data: null };

  const { data: rawComments } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, profiles(full_name)")
    .eq("entity_type", "breakdown")
    .eq("entity_id", params.id)
    .order("created_at", { ascending: true });

  const comments: CommentWithAuthor[] = (rawComments ?? []).map((c: any) => ({
    id: c.id,
    body: c.body,
    created_at: c.created_at,
    author_name: c.profiles?.full_name ?? "Unknown",
  }));

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/breakdowns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to breakdowns
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{breakdown.fault_description}</h1>
          {equipment && (
            <p className="text-sm text-gray-500">
              {equipment.tag_number} — {equipment.name}
            </p>
          )}
        </div>
        <Badge tone={breakdown.priority === "critical" ? "red" : breakdown.priority === "high" ? "amber" : "gray"}>
          {breakdown.priority} priority
        </Badge>
      </div>

      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Quick status</p>
        <QuickStatusActions id={breakdown.id} status={breakdown.status} />
      </Card>

      <Card>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Alarm / Error Code</dt>
            <dd className="font-medium text-gray-900">{breakdown.alarm_code ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Location</dt>
            <dd className="font-medium text-gray-900">{breakdown.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Reported</dt>
            <dd className="font-medium text-gray-900">{new Date(breakdown.start_time).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Downtime</dt>
            <dd className="font-medium text-gray-900">
              {breakdown.downtime_minutes != null ? `${breakdown.downtime_minutes} min` : "In progress"}
            </dd>
          </div>
        </dl>
      </Card>

      <BreakdownEditor breakdown={breakdown} />

      <Card>
        <CommentThread entityType="breakdown" entityId={breakdown.id} comments={comments} />
      </Card>
    </div>
  );
}
