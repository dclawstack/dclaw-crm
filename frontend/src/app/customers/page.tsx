"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ImportModal from "@/components/ImportModal";
import {
  listCustomers, createCustomer, importCustomers, exportCustomers, type CustomerCreate,
} from "@/lib/api";

const STATUSES = ["lead", "prospect", "active", "inactive", "churned"];

function statusBadge(status: string) {
  if (status === "active") return "bg-[#E6F4EC] text-[#2E8B57]";
  if (status === "lead" || status === "prospect") return "bg-[#F1EEF8] text-[#7660A8]";
  return "bg-[#F2F2F4] text-[#7A7A85]";
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Awaited<ReturnType<typeof listCustomers>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CustomerCreate>({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCustomers(200, 0);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await createCustomer(form);
      setOpen(false);
      setForm({ name: "", email: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers?.items.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0F0F12]">Customers</h1>
        <div className="flex items-center gap-2">
          <ImportModal
            label="Customers"
            onImport={importCustomers}
            onExport={exportCustomers}
            exportFilename="customers.csv"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="rounded-xl border-[#E8E8EC]"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-xl border-[#E8E8EC]"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.phone ?? ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="rounded-xl border-[#E8E8EC]"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={form.company ?? ""}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="rounded-xl border-[#E8E8EC]"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!form.name || !form.email || saving}
                  className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]"
                >
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#F5C6C4] bg-[#FBE9E7] px-4 py-3">
          <span className="text-sm text-[#B3261E]">{error}</span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto rounded-full border-[#F5C6C4] text-xs text-[#B3261E] hover:bg-[#F5C6C4]"
            onClick={load}
          >
            Retry
          </Button>
        </div>
      )}

      <Input
        placeholder="Search by name, email, company…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm rounded-xl border-[#E8E8EC] focus:border-[#C9C0DE]"
      />

      <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#E8E8EC]">
                <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Email</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Company</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-[#E8E8EC]">
                    {[0, 1, 2, 3].map((j) => (
                      <TableCell key={j}>
                        <div className="h-4 animate-pulse rounded bg-[#F2F2F4]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
              {!loading && filtered?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[#7A7A85]">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered?.map((c) => (
                <TableRow key={c.id} className="border-b border-[#E8E8EC] hover:bg-[#F8F8FA]">
                  <TableCell>
                    <Link href={`/customers/${c.id}`} className="font-medium text-[#7660A8] hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-[#404049]">{c.email}</TableCell>
                  <TableCell className="text-[#404049]">{c.company ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
