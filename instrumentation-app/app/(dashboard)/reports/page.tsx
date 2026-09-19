"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function exportBreakdowns() {
    setLoading("breakdowns");
    setError(null);
    const { data, error } = await supabase
      .from("breakdowns")
      .select(
        "fault_description, alarm_code, priority, status, location, findings, root_cause, corrective_action, start_time, end_time, downtime_minutes, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      download(`breakdowns-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(data ?? []));
    }
    setLoading(null);
  }

  async function exportEquipment() {
    setLoading("equipment");
    setError(null);
    const { data, error } = await supabase
      .from("equipment")
      .select("tag_number, name, type, location, plant_section, manufacturer, model, status")
      .order("tag_number");

    if (error) {
      setError(error.message);
    } else {
      download(`equipment-report-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(data ?? []));
    }
    setLoading(null);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-brand-600" />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Export data as CSV, ready for Excel</p>
        </div>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Breakdown Report</p>
            <p className="text-xs text-gray-500">All breakdowns with findings, root cause, and downtime</p>
          </div>
          <Button onClick={exportBreakdowns} disabled={loading !== null} variant="secondary" className="gap-1.5">
            <Download className="h-4 w-4" />
            {loading === "breakdowns" ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Equipment Report</p>
            <p className="text-xs text-gray-500">Full equipment database</p>
          </div>
          <Button onClick={exportEquipment} disabled={loading !== null} variant="secondary" className="gap-1.5">
            <Download className="h-4 w-4" />
            {loading === "equipment" ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="bg-blue-50/50 text-sm text-gray-600">
        CSV files open directly in Excel or Google Sheets. PDF-formatted reports (with headers/branding) aren't
        built yet — for now, CSV covers exporting your data for sharing or record-keeping.
      </Card>
    </div>
  );
}
