"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { listActivities, createActivity, listCustomers, listDeals, type ActivityCreate } from "@/lib/api";

const activityTypes = ["call", "email", "meeting", "note"];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Awaited<ReturnType<typeof listActivities>> | null>(null);
  const [customers, setCustomers] = useState<Awaited<ReturnType<typeof listCustomers>> | null>(null);
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ActivityCreate>({
    customer_id: "", activity_type: "note", description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [actsData, custData, dealsData] = await Promise.all([
        listActivities(100, 0),
        listCustomers(100, 0),
        listDeals(100, 0),
      ]);
      setActivities(actsData);
      setCustomers(custData);
      setDeals(dealsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createActivity(form);
      setOpen(false);
      setForm({ customer_id: "", activity_type: "note", description: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create activity");
    } finally {
      setSaving(false);
    }
  };

  const filtered = activities?.items.filter((a) =>
    !typeFilter || a.activity_type === typeFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F0F12]">Activities</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Activity</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Customer</Label>
                <Select
                  value={form.customer_id}
                  onValueChange={(v) => setForm({ ...form, customer_id: v || "" })}
                >
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers?.items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Deal (optional)</Label>
                <Select
                  value={form.deal_id ?? ""}
                  onValueChange={(v) => setForm({ ...form, deal_id: v || null })}
                >
                  <SelectTrigger><SelectValue placeholder="Select deal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {deals?.items.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={form.activity_type}
                  onValueChange={(v) => setForm({ ...form, activity_type: v || "note" })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl border-[#E8E8EC]"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!form.customer_id || !form.description || saving}
                className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "")}>
          <SelectTrigger className="w-48 rounded-xl border-[#E8E8EC]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {activityTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F2F2F4]" />
          ))
        )}
        {!loading && filtered?.length === 0 && (
          <p className="text-[#7A7A85]">No activities found.</p>
        )}
        {!loading && filtered?.map((a) => (
          <Card key={a.id} className="rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardContent className="flex items-start gap-3 py-4">
              <Badge variant="outline" className="text-[#7660A8] border-[#C9C0DE]">
                {a.activity_type}
              </Badge>
              <div className="flex-1">
                <p className="text-sm text-[#404049]">{a.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#7A7A85]">
                  <span>
                    Customer:{" "}
                    <Link href={`/customers/${a.customer_id}`} className="hover:text-[#7660A8] hover:underline">
                      {a.customer.name}
                    </Link>
                  </span>
                  {a.deal && (
                    <span>
                      Deal:{" "}
                      <Link href={`/deals/${a.deal.id}`} className="hover:text-[#7660A8] hover:underline">
                        {a.deal.title}
                      </Link>
                    </span>
                  )}
                  <span>• {new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
