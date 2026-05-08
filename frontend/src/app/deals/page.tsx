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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { listDeals, createDeal, listCustomers, type DealCreate } from "@/lib/api";

const stages = [
  "prospecting",
  "qualification",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>> | null>(null);
  const [customers, setCustomers] = useState<Awaited<ReturnType<typeof listCustomers>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DealCreate>({ customer_id: "", title: "", value: 0 });

  const load = async () => {
    setLoading(true);
    const [dealsData, customersData] = await Promise.all([
      listDeals(100, 0, stageFilter || undefined),
      listCustomers(100, 0),
    ]);
    setDeals(dealsData);
    setCustomers(customersData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [stageFilter]);

  const handleCreate = async () => {
    await createDeal(form);
    setOpen(false);
    setForm({ customer_id: "", title: "", value: 0 });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>Add Deal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Deal</DialogTitle>
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
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v || "prospecting" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={!form.customer_id || !form.title}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v || "")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Probability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading && deals?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    No deals found.
                  </TableCell>
                </TableRow>
              )}
              {deals?.items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link href={`/deals/${d.id}`} className="font-medium hover:underline">
                      {d.title}
                    </Link>
                  </TableCell>
                  <TableCell>{d.customer.name}</TableCell>
                  <TableCell>${d.value.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.stage}</Badge>
                  </TableCell>
                  <TableCell>{d.probability}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
