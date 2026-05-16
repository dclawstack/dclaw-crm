"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import KanbanBoard from "@/components/KanbanBoard";
import ImportModal from "@/components/ImportModal";
import { listDeals, createDeal, listCustomers, importDeals, exportDeals, type DealCreate } from "@/lib/api";

const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal",
  negotiation: "Negotiation", closed_won: "Closed Won", closed_lost: "Closed Lost",
};

function stageBadgeClass(stage: string) {
  if (stage === "closed_won") return "bg-[#E6F4EC] text-[#2E8B57]";
  if (stage === "closed_lost") return "bg-[#F2F2F4] text-[#7A7A85]";
  if (stage === "negotiation") return "bg-[#FBF1DC] text-[#C28A00]";
  return "bg-[#F1EEF8] text-[#7660A8]";
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Awaited<ReturnType<typeof listDeals>> | null>(null);
  const [customers, setCustomers] = useState<Awaited<ReturnType<typeof listCustomers>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DealCreate>({ customer_id: "", title: "", value: 0 });

  const load = async () => {
    setLoading(true);
    const [dealsData, customersData] = await Promise.all([
      listDeals(200, 0, stageFilter || undefined),
      listCustomers(100, 0),
    ]);
    setDeals(dealsData);
    setCustomers(customersData);
    setLoading(false);
  };

  useEffect(() => { load(); }, [stageFilter]);

  const handleCreate = async () => {
    await createDeal(form);
    setOpen(false);
    setForm({ customer_id: "", title: "", value: 0 });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F0F12]">Deals</h1>
        <div className="flex items-center gap-2">
          <ImportModal
            label="Deals"
            onImport={importDeals}
            onExport={exportDeals}
            exportFilename="deals.csv"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <Button className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">Add Deal</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>New Deal</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Customer</Label>
                  <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v || "" })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {customers?.items.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border-[#E8E8EC]" />
                </div>
                <div>
                  <Label>Value</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="rounded-xl border-[#E8E8EC]" />
                </div>
                <div>
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v || "prospecting" })}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={!form.customer_id || !form.title} className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-xl border border-[#E8E8EC] bg-white p-1">
          <button
            onClick={() => setView("table")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${view === "table" ? "bg-[#7660A8] text-white" : "text-[#7A7A85] hover:text-[#404049]"}`}
          >
            Table
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${view === "kanban" ? "bg-[#7660A8] text-white" : "text-[#7A7A85] hover:text-[#404049]"}`}
          >
            Kanban
          </button>
        </div>
        {view === "table" && (
          <Select value={stageFilter} onValueChange={(v) => setStageFilter(v || "")}>
            <SelectTrigger className="w-48 rounded-xl border-[#E8E8EC]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {loading ? (
        <p className="text-[#7A7A85]">Loading…</p>
      ) : view === "kanban" && deals ? (
        <KanbanBoard deals={deals.items} onDealMoved={load} />
      ) : (
        <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#E8E8EC]">
                  <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Title</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Customer</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Value</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Stage</TableHead>
                  <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Probability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals?.items.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-[#7A7A85]">No deals found.</TableCell></TableRow>
                )}
                {deals?.items.map((d) => (
                  <TableRow key={d.id} className="border-b border-[#E8E8EC] hover:bg-[#F8F8FA]">
                    <TableCell>
                      <Link href={`/deals/${d.id}`} className="font-medium text-[#7660A8] hover:text-[#5C4A8E] hover:underline">{d.title}</Link>
                    </TableCell>
                    <TableCell className="text-[#404049]">{d.customer.name}</TableCell>
                    <TableCell className="font-medium text-[#0F0F12]">${d.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stageBadgeClass(d.stage)}`}>{STAGE_LABELS[d.stage]}</span>
                    </TableCell>
                    <TableCell className="text-[#404049]">{d.probability}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
