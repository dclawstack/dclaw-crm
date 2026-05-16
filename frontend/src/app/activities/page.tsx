"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ActivityCreate>({
    customer_id: "",
    activity_type: "note",
    description: "",
  });

  const load = async () => {
    setLoading(true);
    const [actsData, custData, dealsData] = await Promise.all([
      listActivities(100, 0),
      listCustomers(100, 0),
      listDeals(100, 0),
    ]);
    setActivities(actsData);
    setCustomers(custData);
    setDeals(dealsData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    await createActivity(form);
    setOpen(false);
    setForm({ customer_id: "", activity_type: "note", description: "" });
    await load();
  };

  const filtered = activities?.items.filter((a) => {
    if (!typeFilter) return true;
    return a.activity_type === typeFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>Add Activity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Customer</Label>
                <Select
                  value={form.customer_id}
                  onValueChange={(v) => setForm({ ...form, customer_id: v || "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {deals?.items.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title}
                      </SelectItem>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} disabled={!form.customer_id || !form.description}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {activityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-[#7A7A85]">Loading...</p>}
        {!loading && filtered?.length === 0 && <p className="text-[#7A7A85]">No activities found.</p>}
        {filtered?.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start gap-3 py-4">
              <Badge variant="outline">{a.activity_type}</Badge>
              <div className="flex-1">
                <p className="text-sm">{a.description}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-[#7A7A85]">
                  <span>
                    Customer:{" "}
                    <Link href={`/customers/${a.customer_id}`} className="hover:underline">
                      {a.customer.name}
                    </Link>
                  </span>
                  {a.deal && (
                    <span>
                      Deal:{" "}
                      <Link href={`/deals/${a.deal.id}`} className="hover:underline">
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
