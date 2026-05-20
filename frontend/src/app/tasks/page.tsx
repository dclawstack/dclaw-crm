"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDueTodayActivities, getOverdueActivities, toggleActivityComplete, type Activity } from "@/lib/api";

export default function TasksPage() {
  const [todayTasks, setTodayTasks] = useState<Activity[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [today, overdue] = await Promise.all([
        getDueTodayActivities(),
        getOverdueActivities(),
      ]);
      setTodayTasks(today.items);
      setOverdueTasks(overdue.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id: string) => {
    try {
      await toggleActivityComplete(id);
      await load();
    } catch {
      // Toggle failure is non-critical — silently ignore
    }
  };

  const TaskRow = ({ task, overdue }: { task: Activity; overdue?: boolean }) => (
    <div className="flex items-start gap-3 rounded-xl border border-[#E8E8EC] bg-white p-3 shadow-[0_2px_6px_rgba(15,15,18,0.06)]">
      <button
        onClick={() => handleToggle(task.id)}
        className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 transition-all duration-[240ms] ${
          task.completed
            ? "border-[#7660A8] bg-[#7660A8]"
            : "border-[#D6D6D6] bg-white hover:border-[#7660A8]"
        }`}
      >
        {task.completed && (
          <svg viewBox="0 0 16 16" fill="none" className="text-white" stroke="currentColor" strokeWidth="2.5">
            <polyline points="3 8 7 12 13 5" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? "line-through text-[#A3A3AC]" : "text-[#404049]"}`}>
          {task.description}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#7A7A85]">
          <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-[#7660A8]">{task.activity_type}</span>
          <Link href={`/customers/${task.customer_id}`} className="hover:text-[#7660A8] hover:underline">
            Customer ↗
          </Link>
          {task.deal_id && (
            <Link href={`/deals/${task.deal_id}`} className="hover:text-[#7660A8] hover:underline">Deal ↗</Link>
          )}
          {task.scheduled_at && (
            <span className={overdue ? "text-[#B3261E] font-medium" : "text-[#7A7A85]"}>
              {new Date(task.scheduled_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F0F12]">Tasks</h1>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#F5C6C4] bg-[#FBE9E7] px-4 py-3">
          <span className="text-sm text-[#B3261E]">{error}</span>
          <Button
            variant="outline" size="sm"
            className="ml-auto rounded-full border-[#F5C6C4] text-xs text-[#B3261E] hover:bg-[#F5C6C4]"
            onClick={load}
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F2F2F4]" />
          ))}
        </div>
      ) : (
        <>
          {overdueTasks.length > 0 && (
            <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-[#B3261E]">
                  Overdue ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueTasks.map((t) => <TaskRow key={t.id} task={t} overdue />)}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-[#0F0F12]">
                Due Today ({todayTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-[#7A7A85]">No tasks due today.</p>
              ) : (
                todayTasks.map((t) => <TaskRow key={t.id} task={t} />)
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
