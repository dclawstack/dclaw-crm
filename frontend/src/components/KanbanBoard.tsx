"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { moveDealStage, type Deal } from "@/lib/api";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const STAGES = [
  { key: "prospecting", label: "Prospecting" },
  { key: "qualification", label: "Qualification" },
  { key: "proposal", label: "Proposal" },
  { key: "negotiation", label: "Negotiation" },
  { key: "closed_won", label: "Closed Won" },
  { key: "closed_lost", label: "Closed Lost" },
];

interface Props {
  deals: Deal[];
  onDealMoved: () => void;
}

interface StageChangedEvent {
  type: "deal_stage_changed";
  deal_id: string;
  old_stage: string;
  stage: string;
  title: string;
  value: number;
  customer_name: string;
  probability: number;
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-[#F1EEF8] text-[#7660A8]";
  if (score >= 40) return "bg-[#FBF1DC] text-[#C28A00]";
  return "bg-[#FBE9E7] text-[#B3261E]";
}

export default function KanbanBoard({ deals: initialDeals, onDealMoved }: Props) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  // Track which deal IDs were just moved via SSE so we can show a flash highlight
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const esRef = useRef<EventSource | null>(null);

  // Keep local deals in sync when parent re-fetches (e.g. page load, filter change)
  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  // Subscribe to SSE on mount, clean up on unmount
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const url = `${API_BASE}/api/v1/sse/deals/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type !== "deal_stage_changed") return;
        handleRemoteStageChange(event as StageChangedEvent);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects after errors — no manual retry needed
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — token is stable across renders

  function handleRemoteStageChange(event: StageChangedEvent) {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === event.deal_id ? { ...d, stage: event.stage } : d
      )
    );
    // Yellow flash for 1.2s so users notice the live update
    setFlashIds((prev) => new Set(prev).add(event.deal_id));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(event.deal_id);
        return next;
      });
    }, 1200);
  }

  const byStage = (stage: string) => deals.filter((d) => d.stage === stage);
  const stageTotal = (stage: string) =>
    byStage(stage).reduce((s, d) => s + d.value, 0);

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    setDragging(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOver(stage);
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) {
      setDragging(null);
      setDragOver(null);
      return;
    }

    // Optimistic update — move the card immediately so the drag feels instant
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage } : d))
    );

    try {
      await moveDealStage(dealId, stage);
      // SSE will echo back the change — other users see it; our own update is
      // already applied so the duplicate event is a no-op
      onDealMoved();
    } catch {
      // Revert optimistic update on failure
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d))
      );
    }
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((s) => {
        const stageDeals = byStage(s.key);
        const isWon = s.key === "closed_won";
        return (
          <div
            key={s.key}
            className={`flex-shrink-0 w-64 rounded-2xl border transition-all duration-[240ms] ${
              dragOver === s.key
                ? "border-[#C9C0DE] bg-[#F8F6FB]"
                : "border-[#E8E8EC] bg-[#F8F8FA]"
            }`}
            onDragOver={(e) => handleDragOver(e, s.key)}
            onDrop={(e) => handleDrop(e, s.key)}
            onDragLeave={() => setDragOver(null)}
          >
            <div
              className={`rounded-t-2xl px-4 py-3 border-b border-[#E8E8EC] ${
                isWon ? "bg-[#E6F4EC]" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#7A7A85]">
                  {s.label}
                </span>
                <span className="rounded-full bg-[#F2F2F4] px-2 py-0.5 text-xs font-medium text-[#7A7A85]">
                  {stageDeals.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#A3A3AC]">
                ${stageTotal(s.key).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 p-3 min-h-[120px]">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  className={`rounded-xl border bg-white p-3 cursor-grab shadow-[0_2px_6px_rgba(15,15,18,0.06)] hover:shadow-[0_8px_20px_rgba(15,15,18,0.08)] transition-all duration-[240ms] ${
                    dragging === deal.id ? "opacity-50" : ""
                  } ${
                    // Brief yellow ring when another user's SSE event moves this card
                    flashIds.has(deal.id)
                      ? "border-[#C28A00] ring-2 ring-[#FBF1DC]"
                      : "border-[#E8E8EC]"
                  }`}
                >
                  <Link
                    href={`/deals/${deal.id}`}
                    className="block hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-sm font-semibold text-[#0F0F12] truncate">{deal.title}</p>
                    <p className="text-xs text-[#7A7A85] truncate">{deal.customer.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-[#404049]">
                        ${deal.value.toLocaleString()}
                      </span>
                      <span className="rounded-full bg-[#F1EEF8] px-2 py-0.5 text-xs text-[#7660A8]">
                        {deal.probability}%
                      </span>
                    </div>
                  </Link>
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-[#E8E8EC]">
                  <span className="text-xs text-[#A3A3AC]">Drop here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
