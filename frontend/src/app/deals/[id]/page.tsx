"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuditLogTimeline from "@/components/AuditLogTimeline";
import {
  getDeal, updateDeal, listActivities, getDealHealth, listNotes, createNote, deleteNote,
  type Activity, type Note,
} from "@/lib/api";

const STAGES = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"];
const STAGE_LABELS: Record<string, string> = {
  prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal",
  negotiation: "Negotiation", closed_won: "Closed Won", closed_lost: "Closed Lost",
};

function healthColor(score: number) {
  if (score >= 70) return "bg-[#F1EEF8] text-[#7660A8]";
  if (score >= 40) return "bg-[#FBF1DC] text-[#C28A00]";
  return "bg-[#FBE9E7] text-[#B3261E]";
}

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Awaited<ReturnType<typeof getDeal>> | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [health, setHealth] = useState<{ score: number; signals: Array<{ label: string; impact: string }> } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [dealData, activitiesData, healthData, notesData] = await Promise.all([
      getDeal(id),
      listActivities(100, 0, undefined, id),
      getDealHealth(id),
      listNotes(undefined, id),
    ]);
    setDeal(dealData);
    setActivities(activitiesData.items);
    setHealth(healthData);
    setNotes(notesData.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleStageChange = async (stage: string) => {
    if (!id) return;
    await updateDeal(id, { stage });
    await load();
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !id) return;
    await createNote({ content: noteText.trim(), deal_id: id });
    setNoteText("");
    const notesData = await listNotes(undefined, id);
    setNotes(notesData.items);
  };

  const handleDeleteNote = async (nid: string) => {
    await deleteNote(nid);
    const notesData = await listNotes(undefined, id);
    setNotes(notesData.items);
  };

  if (loading) return <div className="text-[#7A7A85]">Loading…</div>;
  if (!deal) return <div className="text-[#7A7A85]">Deal not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F0F12]">{deal.title}</h1>
          <p className="text-[#7A7A85]">
            <Link href={`/customers/${deal.customer_id}`} className="hover:text-[#7660A8] hover:underline">{deal.customer.name}</Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {health && (
            <span title={health.signals.map((s) => `${s.label} ${s.impact}`).join(", ")}
              className={`rounded-full px-3 py-1 text-sm font-medium ${healthColor(health.score)}`}>
              Health {health.score}
            </span>
          )}
          <span className="rounded-full bg-[#F1EEF8] px-3 py-1 text-sm font-medium text-[#7660A8]">{STAGE_LABELS[deal.stage]}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Value", value: `$${deal.value.toLocaleString()}` },
          { label: "Probability", value: `${deal.probability}%` },
          { label: "Expected Close", value: deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : "—" },
        ].map(({ label, value }) => (
          <Card key={label} className="rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-[#7A7A85]">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-bold text-[#0F0F12]">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
        <CardHeader><CardTitle className="text-sm text-[#0F0F12]">Move Stage</CardTitle></CardHeader>
        <CardContent>
          <Select value={deal.stage} onValueChange={handleStageChange}>
            <SelectTrigger className="w-64 rounded-xl border-[#E8E8EC]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="activities">
        <TabsList className="rounded-xl border border-[#E8E8EC] bg-[#F2F2F4] p-1">
          <TabsTrigger value="activities" className="rounded-lg text-xs">Activities ({activities.length})</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg text-xs">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs">History</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardContent className="p-0">
              {activities.length === 0 && <p className="p-6 text-[#7A7A85]">No activities for this deal.</p>}
              {activities.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#E8E8EC]">
                      <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Type</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Description</TableHead>
                      <TableHead className="text-xs uppercase tracking-wide text-[#7A7A85]">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((a) => (
                      <TableRow key={a.id} className="border-b border-[#E8E8EC]">
                        <TableCell>
                          <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs text-[#7660A8]">{a.activity_type}</span>
                        </TableCell>
                        <TableCell className="text-sm text-[#404049]">{a.description}</TableCell>
                        <TableCell className="text-xs text-[#7A7A85]">{new Date(a.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-3">
            <div className="flex gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note…"
                rows={2}
                className="flex-1 rounded-xl border border-[#E8E8EC] bg-white px-3 py-2 text-sm text-[#404049] placeholder-[#A3A3AC] focus:border-[#C9C0DE] focus:outline-none resize-none"
              />
              <Button onClick={handleSaveNote} disabled={!noteText.trim()} className="self-start rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">
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
          <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
            <CardContent className="py-4">
              <AuditLogTimeline entityType="deal" entityId={id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
