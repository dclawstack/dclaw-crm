"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import AuditLogTimeline from "@/components/AuditLogTimeline";
import {
  getCustomer, updateCustomerStatus, enrichCustomer,
  listNotes, createNote, deleteNote,
  listContacts, createContact, deleteContact,
  type Note, type Contact, type ContactCreate,
} from "@/lib/api";

const STATUSES = ["lead", "prospect", "active", "inactive", "churned"];

function statusBadge(status: string) {
  if (status === "active") return "bg-[#E6F4EC] text-[#2E8B57]";
  if (status === "lead" || status === "prospect") return "bg-[#F1EEF8] text-[#7660A8]";
  return "bg-[#F2F2F4] text-[#7A7A85]";
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Awaited<ReturnType<typeof getCustomer>> | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [noteText, setNoteText] = useState("");
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState<ContactCreate>({ customer_id: id ?? "", name: "" });
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [cust, notesData, contactsData] = await Promise.all([
        getCustomer(id),
        listNotes(id, undefined),
        listContacts(id),
      ]);
      setCustomer(cust);
      setNotes(notesData.items);
      setContacts(contactsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateCustomerStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleEnrich = async () => {
    if (!id) return;
    setEnriching(true);
    try {
      const result = await enrichCustomer(id);
      const fields = result.enriched_fields.length;
      setEnrichResult(fields > 0 ? `${fields} field${fields > 1 ? "s" : ""} updated` : "No new data found");
      await load();
    } catch {
      setEnrichResult("Enrichment failed");
    } finally {
      setEnriching(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !id) return;
    try {
      await createNote({ content: noteText.trim(), customer_id: id });
      setNoteText("");
      const notesData = await listNotes(id, undefined);
      setNotes(notesData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  const handleDeleteNote = async (nid: string) => {
    try {
      await deleteNote(nid);
      const notesData = await listNotes(id!, undefined);
      setNotes(notesData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const handleCreateContact = async () => {
    if (!id || !contactForm.name) return;
    try {
      await createContact(id, { ...contactForm, customer_id: id });
      setContactForm({ customer_id: id, name: "" });
      setContactDialogOpen(false);
      const contactsData = await listContacts(id);
      setContacts(contactsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    }
  };

  const handleDeleteContact = async (cid: string) => {
    try {
      await deleteContact(cid);
      const contactsData = await listContacts(id!);
      setContacts(contactsData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[#F2F2F4]" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F2F2F4]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#F5C6C4] bg-[#FBE9E7] px-4 py-3">
        <span className="text-sm text-[#B3261E]">{error}</span>
        <Button variant="outline" size="sm"
          className="ml-auto rounded-full border-[#F5C6C4] text-xs text-[#B3261E] hover:bg-[#F5C6C4]"
          onClick={load}
        >Retry</Button>
      </div>
    );
  }

  if (!customer) return <div className="text-[#7A7A85]">Customer not found.</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#F5C6C4] bg-[#FBE9E7] px-4 py-3">
          <span className="text-sm text-[#B3261E]">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-xs text-[#B3261E] hover:underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F12]">{customer.name}</h1>
          <p className="text-[#7A7A85]">{customer.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {customer.company && (
            <Button
              variant="outline" size="sm" onClick={handleEnrich} disabled={enriching}
              className="rounded-full border-[#E8E8EC] text-[#7660A8] hover:bg-[#F1EEF8]"
            >
              {enriching ? "Enriching…" : "Enrich"}
            </Button>
          )}
          {enrichResult && <span className="text-xs text-[#7A7A85]">{enrichResult}</span>}
          <Select value={customer.status} onValueChange={handleStatusChange}>
            <SelectTrigger className={`w-36 rounded-full border-0 text-xs font-medium ${statusBadge(customer.status)}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Phone", value: customer.phone ?? "—" },
          { label: "Company", value: customer.company ?? "—" },
          { label: "Created", value: new Date(customer.created_at).toLocaleDateString() },
        ].map(({ label, value }) => (
          <Card key={label} className="rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-[#7A7A85]">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#404049]">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="deals">
        <TabsList className="rounded-xl border border-[#E8E8EC] bg-[#F2F2F4] p-1">
          <TabsTrigger value="deals" className="rounded-lg text-xs">Deals ({customer.deals.length})</TabsTrigger>
          <TabsTrigger value="activities" className="rounded-lg text-xs">Activities ({customer.activities.length})</TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-lg text-xs">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg text-xs">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs">History</TabsTrigger>
        </TabsList>

        <TabsContent value="deals">
          {customer.deals.length === 0 ? <p className="mt-3 text-[#7A7A85]">No deals yet.</p> : (
            <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E8E8EC]">
                      <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Title</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Value</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Stage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.deals.map((d) => (
                      <TableRow key={d.id} className="border-b border-[#E8E8EC]">
                        <TableCell>
                          <Link href={`/deals/${d.id}`} className="text-[#7660A8] hover:underline">{d.title}</Link>
                        </TableCell>
                        <TableCell className="text-[#404049]">${d.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs text-[#7660A8]">{d.stage}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities">
          {customer.activities.length === 0 ? <p className="mt-3 text-[#7A7A85]">No activities yet.</p> : (
            <div className="mt-3 space-y-2">
              {customer.activities.map((a) => (
                <Card key={a.id} className="rounded-2xl border-[#E8E8EC] shadow-sm">
                  <CardContent className="flex items-start gap-3 py-3 px-4">
                    <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs text-[#7660A8]">{a.activity_type}</span>
                    <div className="flex-1">
                      <p className="text-sm text-[#404049]">{a.description}</p>
                      <p className="text-xs text-[#7A7A85]">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacts">
          <div className="mt-3 space-y-3">
            <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="rounded-xl border-[#E8E8EC]" /></div>
                  <div><Label>Email</Label><Input value={contactForm.email ?? ""} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="rounded-xl border-[#E8E8EC]" /></div>
                  <div><Label>Phone</Label><Input value={contactForm.phone ?? ""} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} className="rounded-xl border-[#E8E8EC]" /></div>
                  <div><Label>Title</Label><Input value={contactForm.title ?? ""} onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })} className="rounded-xl border-[#E8E8EC]" /></div>
                  <Button onClick={handleCreateContact} disabled={!contactForm.name} className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">Save</Button>
                </div>
              </DialogContent>
            </Dialog>
            {contacts.length === 0 && <p className="text-sm text-[#7A7A85]">No contacts yet.</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              {contacts.map((c) => (
                <Card key={c.id} className="rounded-2xl border-[#E8E8EC] shadow-sm">
                  <CardContent className="flex items-start justify-between py-3 px-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0F0F12]">
                        {c.name}{c.is_primary && <span className="ml-1 text-[#7660A8]">★</span>}
                      </p>
                      {c.title && <p className="text-xs text-[#7A7A85]">{c.title}</p>}
                      {c.email && <p className="text-xs text-[#404049]">{c.email}</p>}
                      {c.phone && <p className="text-xs text-[#404049]">{c.phone}</p>}
                    </div>
                    <button onClick={() => handleDeleteContact(c.id)} className="text-[#A3A3AC] hover:text-[#B3261E] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note…"
                rows={2}
                className="flex-1 rounded-xl border border-[#E8E8EC] bg-white px-3 py-2 text-sm text-[#404049] placeholder-[#A3A3AC] focus:border-[#C9C0DE] focus:outline-none resize-none"
              />
              <Button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="self-start rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]"
              >
                Save
              </Button>
            </div>
            {notes.map((n) => (
              <Card key={n.id} className="rounded-2xl border-[#E8E8EC] shadow-sm">
                <CardContent className="flex items-start justify-between gap-3 py-3 px-4">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm text-[#404049]">{n.content}</p>
                    <p className="mt-1 text-xs text-[#7A7A85]">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDeleteNote(n.id)} className="text-[#A3A3AC] hover:text-[#B3261E] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 && <p className="text-sm text-[#7A7A85]">No notes yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="mt-3 rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardContent className="py-4">
              <AuditLogTimeline entityType="customer" entityId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
