"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  listWebhooks, createWebhook, deleteWebhook, getWebhookDeliveries,
  type WebhookEndpoint, type WebhookDelivery,
} from "@/lib/api";

const ALL_EVENTS = [
  "customer.created", "customer.updated",
  "deal.created", "deal.stage_changed",
  "activity.created",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<Record<string, WebhookDelivery[]>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ url: "", secret: "", events: [] as string[] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await listWebhooks();
    setWebhooks(data.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter((e) => e !== event) : [...f.events, event],
    }));
  };

  const handleCreate = async () => {
    if (!form.url || form.events.length === 0) return;
    await createWebhook({ url: form.url, secret: form.secret, events: form.events });
    setOpen(false);
    setForm({ url: "", secret: "", events: [] });
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteWebhook(id);
    await load();
  };

  const loadDeliveries = async (id: string) => {
    const items = await getWebhookDeliveries(id);
    setDeliveries((d) => ({ ...d, [id]: items }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F0F12]">Webhooks</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">Add Endpoint</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Webhook Endpoint</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>URL</Label><Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.com/hook" className="rounded-xl border-[#E8E8EC]" /></div>
              <div><Label>Secret</Label><Input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })} placeholder="hmac-secret" className="rounded-xl border-[#E8E8EC]" /></div>
              <div>
                <Label>Events</Label>
                <div className="mt-2 space-y-2">
                  {ALL_EVENTS.map((event) => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded border-[#E8E8EC] text-[#7660A8]"
                      />
                      <span className="text-sm text-[#404049]">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={!form.url || form.events.length === 0} className="rounded-full bg-[#7660A8] text-white hover:bg-[#5C4A8E]">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="text-[#7A7A85]">Loading…</p> : webhooks.length === 0 ? (
        <Card className="rounded-2xl border-[#E8E8EC] shadow-sm">
          <CardContent className="py-8 text-center text-[#7A7A85]">No webhook endpoints yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((w) => (
            <Card key={w.id} className="rounded-2xl border-[#E8E8EC] shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-[#0F0F12]">{w.url}</CardTitle>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {w.events.map((e) => (
                      <span key={e} className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs text-[#7660A8]">{e}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg border-[#E8E8EC] text-xs" onClick={() => loadDeliveries(w.id)}>
                    Deliveries
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg border-[#E8E8EC] text-[#B3261E] hover:bg-[#FBE9E7] text-xs" onClick={() => handleDelete(w.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
              {deliveries[w.id] && (
                <CardContent className="space-y-1">
                  {deliveries[w.id].length === 0 && <p className="text-xs text-[#7A7A85]">No deliveries yet.</p>}
                  {deliveries[w.id].map((d) => (
                    <div key={d.id} className="flex items-center gap-3 text-xs text-[#404049]">
                      <span className={`rounded-full px-2 py-0.5 ${d.status_code && d.status_code < 300 ? "bg-[#E6F4EC] text-[#2E8B57]" : "bg-[#FBE9E7] text-[#B3261E]"}`}>
                        {d.status_code ?? "err"}
                      </span>
                      <span>{d.event}</span>
                      <span className="text-[#A3A3AC]">{new Date(d.created_at).toLocaleString()}</span>
                      <span className="text-[#A3A3AC]">{d.attempts} attempt{d.attempts !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
