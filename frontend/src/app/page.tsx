"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboard } from "@/lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-slate-500">Loading dashboard...</div>;
  }

  const stageOrder = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
  const stageLabels: Record<string, string> = {
    prospecting: "Prospecting",
    qualification: "Qualification",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
  };

  const maxStageCount = Math.max(...stageOrder.map((s) => data.deals_by_stage[s] ?? 0), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.total_customers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Open Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.open_deals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${data.total_pipeline_value.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.win_rate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deals by Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stageOrder.map((stage) => {
              const count = data.deals_by_stage[stage] ?? 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stageLabels[stage]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-100">
                    <div
                      className="h-2 rounded bg-slate-800"
                      style={{ width: `${(count / maxStageCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recent_activities.length === 0 && (
              <p className="text-sm text-slate-500">No recent activities.</p>
            )}
            {data.recent_activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <Badge variant="outline">{a.activity_type}</Badge>
                <div className="flex-1">
                  <p className="text-sm">{a.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
