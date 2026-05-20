"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboard, getForecast } from "@/lib/api";

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
type ForecastData = Awaited<ReturnType<typeof getForecast>>;

const STAGE_ORDER = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const PRESETS = [
  { label: "All Time", from: "", to: "" },
  { label: "Today", from: () => today(), to: () => today() },
  { label: "This Week", from: () => weekStart(), to: () => today() },
  { label: "This Month", from: () => monthStart(), to: () => today() },
  { label: "This Quarter", from: () => quarterStart(), to: () => today() },
];

function today() { return new Date().toISOString().slice(0, 10); }
function weekStart() {
  const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().slice(0, 10);
}
function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function quarterStart() {
  const d = new Date(); const q = Math.floor(d.getMonth() / 3);
  return `${d.getFullYear()}-${String(q * 3 + 1).padStart(2, "0")}-01`;
}

function StatCardSkeleton() {
  return (
    <Card className="rounded-2xl border-[#E8E8EC] bg-white shadow-sm">
      <CardHeader className="pb-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[#F2F2F4]" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 animate-pulse rounded bg-[#F2F2F4]" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const [dash, fore] = await Promise.all([
        getDashboard(from || undefined, to || undefined),
        getForecast(from || undefined, to || undefined),
      ]);
      setData(dash);
      setForecast(fore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(fromDate, toDate); }, [fromDate, toDate, load]);

  const applyPreset = (from: string | (() => string), to: string | (() => string)) => {
    setFromDate(typeof from === "function" ? from() : from);
    setToDate(typeof to === "function" ? to() : to);
  };

  const maxStageCount = Math.max(...STAGE_ORDER.map((s) => data?.deals_by_stage[s] ?? 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F0F12]">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="outline"
              size="sm"
              className="rounded-full border-[#E8E8EC] text-xs hover:border-[#C9C0DE] hover:bg-[#F1EEF8] hover:text-[#7660A8]"
              onClick={() => applyPreset(p.from, p.to)}
            >
              {p.label}
            </Button>
          ))}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-xl border border-[#E8E8EC] bg-white px-2 py-1 text-xs focus:border-[#C9C0DE] focus:outline-none"
          />
          <span className="text-xs text-[#7A7A85]">—</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-xl border border-[#E8E8EC] bg-white px-2 py-1 text-xs focus:border-[#C9C0DE] focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#F5C6C4] bg-[#FBE9E7] px-4 py-3">
          <span className="text-sm text-[#B3261E]">{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto rounded-full border-[#F5C6C4] text-xs text-[#B3261E] hover:bg-[#F5C6C4]"
            onClick={() => load(fromDate, toDate)}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <Card key={i} className="rounded-2xl border-[#E8E8EC] bg-white shadow-sm">
                <CardContent className="p-6 space-y-3">
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="h-4 animate-pulse rounded bg-[#F2F2F4]" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Customers", value: data.total_customers.toLocaleString() },
              { label: "Open Deals", value: data.open_deals.toLocaleString() },
              { label: "Pipeline Value", value: `$${data.total_pipeline_value.toLocaleString()}` },
              { label: "Win Rate", value: `${data.win_rate}%` },
            ].map(({ label, value }) => (
              <Card key={label} className="rounded-2xl border-[#E8E8EC] bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-[#7A7A85]">
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#0F0F12]">{value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {forecast && (
            <Card className="rounded-2xl border-[#E8E8EC] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[#0F0F12]">Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Weighted Pipeline", value: `$${forecast.weighted_pipeline.toLocaleString()}`, color: "text-[#7660A8]" },
                    { label: "Commit", value: `$${forecast.commit.toLocaleString()}`, color: "text-[#2E8B57]" },
                    { label: "Best Case", value: `$${forecast.best_case.toLocaleString()}`, color: "text-[#404049]" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="text-xs text-[#7A7A85] uppercase tracking-wide">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-[#E8E8EC] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[#0F0F12]">Deals by Stage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {STAGE_ORDER.map((stage) => {
                  const count = data.deals_by_stage[stage] ?? 0;
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#404049]">{STAGE_LABELS[stage]}</span>
                        <span className="font-medium text-[#0F0F12]">{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#F2F2F4]">
                        <div
                          className="h-1.5 rounded-full bg-[#7660A8] transition-all duration-[240ms]"
                          style={{ width: `${(count / maxStageCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-[#E8E8EC] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[#0F0F12]">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.recent_activities.length === 0 && (
                  <p className="text-sm text-[#7A7A85]">No recent activities.</p>
                )}
                {data.recent_activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl border border-[#E8E8EC] p-3">
                    <Badge className="bg-[#F1EEF8] text-[#7660A8] border-0 text-xs">
                      {a.activity_type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-[#404049]">{a.description}</p>
                      <p className="text-xs text-[#7A7A85]">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
